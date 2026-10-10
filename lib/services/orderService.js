    import db from "../../config/database.js";

    import AppError from "../utils/AppError.js";
    import generateInvoice from "../utils/generateInvoice.js";

    import * as eventRepository from "../repositories/eventRepository.js";
    import * as eventTicketCategoryRepository from "../repositories/eventTicketCategoryRepository.js";
    import * as userVoucherRepository from "../repositories/userVoucherRepository.js";
    import * as voucherService from "./voucherService.js";
    import * as orderRepository from "../repositories/orderRepository.js";
    import * as settingsService from "./settingsService.js";
    import { calculateOrderAmounts } from "../utils/pricing.js";

    export const createOrder = async (userId, body) => {

        const connection = await db.getConnection();

        try {

            await connection.beginTransaction();

            // =========================
            // Validasi Event
            // =========================

            const event = await eventRepository.findById(body.event_id);

            if (!event) {
                throw new AppError("Event tidak ditemukan", 404);
            }

            // =========================
            // Validasi Tiket
            // =========================

            let totalTicket = 0;
            let totalPrice = 0;

            const orderDetails = [];

            for (const item of body.tickets) {

                const category =
                    await eventTicketCategoryRepository.findByIdForUpdate(
                        connection,
                        item.ticket_category_id
                    );

                if (!category) {
                    throw new AppError("Kategori tiket tidak ditemukan", 404);
                }

                // Kategori harus milik event yang dipesan; kalau tidak, voucher
                // event A bisa dipakai untuk membeli tiket event B.
                if (Number(category.event_id) !== Number(body.event_id)) {
                    throw new AppError(
                        "Kategori tiket tidak sesuai dengan event",
                        400
                    );
                }

                if (category.remaining_stock < item.quantity) {
                    throw new AppError(
                        `Stok tiket tidak mencukupi (tersisa ${category.remaining_stock})`,
                        400
                    );
                }

                const subtotal = category.price * item.quantity;

                totalTicket += item.quantity;
                totalPrice += subtotal;

                orderDetails.push({
                    ticket_category_id: category.id,
                    quantity: item.quantity,
                    price: category.price,
                    subtotal
                });

            }

            // =========================
            // Validasi Voucher
            // =========================

            let voucherId = null;
            let userVoucherId = null;
            let discountAmount = 0;

            if (body.user_voucher_id) {

                // Kunci baris voucher milik customer supaya tidak bisa
                // dipakai dua order sekaligus.
                const userVoucher =
                    await userVoucherRepository.findByIdForUpdate(
                        connection,
                        body.user_voucher_id
                    );

                voucherService.assertUserVoucherUsable(
                    userVoucher,
                    {
                        userId,
                        eventId: body.event_id,
                        totalTicket
                    }
                );

                userVoucherId = userVoucher.id;
                voucherId = userVoucher.voucher_id;

                discountAmount =
                    voucherService.calculateDiscount(
                        userVoucher,
                        totalPrice
                    );

            }

            // =========================
            // Hitung Harga
            // =========================

            // Biaya layanan = persentase dari harga tiket (setelah diskon),
            // ditanggung customer. Persentasenya disimpan di order (snapshot)
            // supaya perubahan pengaturan di kemudian hari tidak mengubah
            // order lama.
            const serviceFeePercent =
                await settingsService.getServiceFeePercent(connection);

            const amounts = calculateOrderAmounts({
                totalPrice,
                discountAmount,
                serviceFeePercent
            });

            // =========================
            // Generate Invoice
            // =========================

            const invoiceNumber = generateInvoice();

            const expiredAt = new Date(
                Date.now() + (15 * 60 * 1000)
            );

            // =========================
            // Insert Order
            // =========================

            const orderId =
                await orderRepository.createOrder(
                    connection,
                    {
                        event_id: body.event_id,
                        customer_id: userId,
                        voucher_id: voucherId,
                        invoice_number: invoiceNumber,
                        total_price: amounts.totalPrice,
                        discount_amount: amounts.discountAmount,
                        final_price: amounts.finalPrice,
                        service_fee_percent: amounts.serviceFeePercent,
                        service_fee: amounts.serviceFee,
                        grand_total: amounts.grandTotal,
                        status: "pending",
                        expired_at: expiredAt
                    }
                );

            // =========================
            // Insert Detail & Update Stock
            // =========================

            for (const detail of orderDetails) {

                await orderRepository.createOrderDetail(
                    connection,
                    {
                        order_id: orderId,
                        ...detail
                    }
                );

                await eventTicketCategoryRepository.updateRemainingStock(
                    connection,
                    detail.ticket_category_id,
                    detail.quantity
                );

            }

            // =========================
            // Update Voucher
            // =========================

            if (userVoucherId) {

                const marked =
                    await userVoucherRepository.markUsed(
                        connection,
                        userVoucherId,
                        orderId,
                        new Date()
                    );

                if (!marked) {
                    throw new AppError("Voucher sudah digunakan", 400);
                }

            }

            await connection.commit();

            return await orderRepository.getOrderById(orderId);

        } catch (err) {

            await connection.rollback();

            throw err;

        } finally {

            connection.release();

        }

    };

    export const getOrders = async () => {

        return await orderRepository.getOrders();

    };

    export const getMyOrders = async (userId) => {

        return await orderRepository.getMyOrders(userId);

    };

    export const getOrderById = async (id, userId, userRole) => {
        console.log("id yang dicari:", id)
        const order = await orderRepository.getOrderById(id);

        if (!order) {
            throw new AppError("Order tidak ditemukan", 404);
        }

        const isOwner = order.customer_id === userId;
        const isStaff = ["admin", "superadmin"].includes(userRole);

        if (!isOwner && !isStaff) {
            throw new AppError("Anda tidak memiliki akses ke order ini", 403);
        }

        return order;

    };

    export const cancelOrder = async (orderId, userId, userRole) => {

        const connection = await db.getConnection();

        try {

            await connection.beginTransaction();

            const order = await orderRepository.getOrderById(orderId);

            if (!order) {
                throw new AppError("Order tidak ditemukan", 404);
            }

            const isOwner = order.customer_id === userId;
            const isStaff = ["admin", "superadmin"].includes(userRole);

            if (!isOwner && !isStaff) {
                throw new AppError("Anda tidak memiliki akses ke order ini", 403);
            }

            if (order.status !== "pending") {
                throw new AppError(
                    "Order tidak dapat dibatalkan",
                    400
                );
            }

            const details =
                await orderRepository.getOrderDetails(orderId);

            for (const detail of details) {

                await eventTicketCategoryRepository.increaseRemainingStock(
                    connection,
                    detail.event_ticket_category_id,
                    detail.quantity
                );

            }

            // Kembalikan voucher ke customer agar bisa dipakai lagi.
            await userVoucherRepository.releaseByOrderId(
                connection,
                orderId
            );

            await orderRepository.updateOrderStatus(
                connection,
                orderId,
                "cancelled"
            );

            await connection.commit();

        } catch (err) {

            await connection.rollback();

            throw err;

        } finally {

            connection.release();

        }

    };