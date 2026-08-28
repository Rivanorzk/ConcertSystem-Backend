import db from "../lib/database.js";

import AppError from "../utils/AppError.js";
import generateInvoice from "../utils/generateInvoice.js";

import * as eventRepository from "../repositories/eventRepository.js";
import * as eventTicketCategoryRepository from "../repositories/eventTicketCategoryRepository.js";
import * as voucherRepository from "../repositories/voucherRepository.js";
import * as orderRepository from "../repositories/orderRepository.js";

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
        let discountAmount = 0;

        if (body.voucher_code) {

            const voucher =
                await voucherRepository.getVoucherByCode(
                    connection,
                    body.voucher_code
                );

            if (!voucher) {
                throw new AppError("Voucher tidak ditemukan", 404);
            }

            const now = new Date();
            const startDate = new Date(voucher.start_date);
            const endDate = new Date(voucher.end_date);

            if (now < startDate || now > endDate) {
                throw new AppError("Voucher sudah tidak berlaku", 400);
            }

            if (voucher.used_quota >= voucher.quota) {
                throw new AppError("Kuota voucher habis", 400);
            }

            if (totalTicket < voucher.minimum_ticket) {
                throw new AppError(
                    `Minimal pembelian ${voucher.minimum_ticket} tiket`,
                    400
                );
            }

            voucherId = voucher.id;

            if (voucher.discount_type === "percentage") {

                discountAmount =
                    totalPrice * voucher.discount_value / 100;

            } else {

                discountAmount = voucher.discount_value;

            }

        }

        // =========================
        // Hitung Harga
        // =========================

        const finalPrice =
            Math.max(totalPrice - discountAmount, 0);

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
                    total_price: totalPrice,
                    discount_amount: discountAmount,
                    final_price: finalPrice,
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

        if (voucherId) {

            await voucherRepository.incrementUsedQuota(
                connection,
                voucherId
            );

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

        if (order.voucher_id) {

            await voucherRepository.decrementUsedQuota(
                connection,
                order.voucher_id
            );

        }

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