import db from "../lib/database.js";
import snap from "../lib/midtrans.js";

import AppError from "../utils/AppError.js";

import * as orderRepository from "../repositories/orderRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";
import crypto from "crypto";
import QRCode from "qrcode";

import * as ticketRepository from "../repositories/ticketRepository.js";
import generateTicketCode from "../utils/generateTicketCode.js";

export const createPayment = async (userId, orderId) => {

    // Baca data order dulu pakai pool biasa (cepat, tidak nge-hold koneksi
    // lama). Koneksi transaksi baru dibuka belakangan, sesaat sebelum nulis.
    const order =
        await orderRepository.getOrderWithCustomer(orderId);

    if (!order) {
        throw new AppError(
            "Order tidak ditemukan",
            404
        );
    }

    if (order.customer_id !== userId) {
        throw new AppError(
            "Anda tidak memiliki akses ke order ini",
            403
        );
    }

    if (["paid", "expired", "cancelled"].includes(order.status)) {
        throw new AppError(
            "Order tidak dapat diproses",
            400
        );
    }

    const existingPayment =
        await paymentRepository.getPaymentByOrderId(order.id);

    if (existingPayment) {
        return {
            snap_token: existingPayment.snap_token,
            redirect_url: existingPayment.payment_url
        };
    }

    // =========================
    // Panggil Midtrans DI LUAR transaksi DB — ini request jaringan ke
    // server Midtrans yang bisa makan waktu, jangan sampai nge-hold
    // koneksi database selama itu.
    // =========================

    const parameter = {

        transaction_details: {

            order_id: order.invoice_number,

            gross_amount: Number(order.final_price)

        },

        customer_details: {

            first_name: order.username,

            email: order.email,

            phone: order.phone

        }

    };

    const transaction =
        await snap.createTransaction(parameter);

    // =========================
    // Baru sekarang buka transaksi DB, cuma buat nulis hasilnya. Cepat.
    // =========================

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        try {

            await paymentRepository.createPayment(
                connection,
                {
                    order_id: order.id,
                    midtrans_order_id: order.invoice_number,
                    snap_token: transaction.token,
                    gross_amount: order.final_price,
                    expiry_time: order.expired_at,
                    payment_url: transaction.redirect_url
                }
            );

        } catch (insertErr) {

            // Race condition: ada request lain yang berhasil insert payment
            // untuk order yang sama sepersekian detik lebih dulu (mis. dua
            // tab dibuka bersamaan, atau efek dobel di React dev mode).
            // Daripada gagal, kembalikan payment yang sudah dibuat itu.
            if (insertErr.code === "ER_DUP_ENTRY") {

                const racedPayment =
                    await paymentRepository.getPaymentByOrderId(order.id);

                if (racedPayment) {
                    await connection.commit();

                    return {
                        snap_token: racedPayment.snap_token,
                        redirect_url: racedPayment.payment_url
                    };
                }

            }

            throw insertErr;

        }

        await connection.commit();

        return {

            snap_token: transaction.token,

            redirect_url: transaction.redirect_url

        };

    } catch (err) {

        await connection.rollback();

        throw err;

    } finally {

        connection.release();

    }

};

export const paymentCallback = async (body) => {

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        // =========================
        // Validasi Signature Midtrans
        // =========================

        const signature = crypto
            .createHash("sha512")
            .update(
                body.order_id +
                body.status_code +
                body.gross_amount +
                process.env.MIDTRANS_SERVER_KEY
            )
            .digest("hex");

        const signatureBuffer = Buffer.from(signature, "hex");
        const providedBuffer = Buffer.from(String(body.signature_key || ""), "hex");

        const validSignature =
            signatureBuffer.length === providedBuffer.length &&
            crypto.timingSafeEqual(signatureBuffer, providedBuffer);

        if (!validSignature) {
            throw new AppError("Signature tidak valid", 401);
        }

        // =========================
        // Cari Payment
        // =========================

        const payment =
            await paymentRepository.getPaymentByMidtransOrderId(
                body.order_id
            );

        if (!payment) {
            throw new AppError("Payment tidak ditemukan", 404);
        }

        const order =
            await orderRepository.getOrderById(payment.order_id);

        if (!order) {
            throw new AppError("Order tidak ditemukan", 404);
        }

        // Idempotency guard: order sudah final, tidak perlu diproses ulang
        if (order.status === "paid") {
            await connection.commit();
            return;
        }

        // =========================
        // Update Payment
        // =========================

        await paymentRepository.updatePayment(
            connection,
            payment.order_id,
            {
                transaction_id: body.transaction_id,
                payment_type: body.payment_type,
                transaction_status: body.transaction_status,
                fraud_status: body.fraud_status,
                transaction_time: body.transaction_time,
                settlement_time: body.settlement_time
            }
        );

        // =========================
        // Tentukan Status Order
        // =========================

        let orderStatus = "pending";

        switch (body.transaction_status) {

            case "capture":
            case "settlement":
                orderStatus = "paid";
                break;

            case "pending":
                orderStatus = "pending";
                break;

            case "expire":
                orderStatus = "expired";
                break;

            case "cancel":
                orderStatus = "cancelled";
                break;

            case "deny":
                orderStatus = "failed";
                break;

        }

        // =========================
        // Update Order
        // =========================

        await orderRepository.updateOrderStatus(
            connection,
            payment.order_id,
            orderStatus
        );

        // =========================
        // Generate Ticket
        // =========================

        if (orderStatus === "paid") {

            const details =
                await orderRepository.getOrderDetails(payment.order_id);

            for (const detail of details) {

                for (let i = 0; i < detail.quantity; i++) {

                    const ticketCode = generateTicketCode();

                    const qrCode =
                        await QRCode.toDataURL(ticketCode);

                    await ticketRepository.createTicket(
                        connection,
                        {
                            order_detail_id: detail.id,
                            ticket_code: ticketCode,
                            qr_code: qrCode,
                            status: "active"
                        }
                    );

                }

            }

        }

        await connection.commit();

    } catch (err) {

        await connection.rollback();

        throw err;

    } finally {

        connection.release();

    }

};

export const getPayment = async (userId, userRole, orderId) => {

    const payment =
        await paymentRepository.getPaymentWithOrder(orderId);

    if (!payment) {
        throw new AppError("Payment tidak ditemukan", 404);
    }

    const isOwner = payment.customer_id === userId;
    const isStaff = ["admin", "superadmin"].includes(userRole);

    if (!isOwner && !isStaff) {
        throw new AppError("Anda tidak memiliki akses ke payment ini", 403);
    }

    return payment;

};