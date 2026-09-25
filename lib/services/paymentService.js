import db from "../../config/database.js";
import * as midtrans from "../../config/midtrans.js";

import AppError from "../utils/AppError.js";

import * as orderRepository from "../repositories/orderRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";

import * as ticketRepository from "../repositories/ticketRepository.js";
import generateTicketCode from "../utils/generateTicketCode.js";

const applyTransactionStatus = async (connection, orderId, statusData) => {

    await paymentRepository.updatePayment(
        connection,
        orderId,
        {
            transaction_id: statusData.transaction_id || null,
            payment_type: statusData.payment_type || null,
            transaction_status: statusData.transaction_status,
            fraud_status: statusData.fraud_status || null,
            transaction_time: statusData.transaction_time || null,
            settlement_time: statusData.settlement_time || null
        }
    );

    let orderStatus = "pending";

    switch (statusData.transaction_status) {

        case "capture":
            orderStatus = statusData.fraud_status === "accept" ? "paid" : "pending";
            break;

        case "settlement":
            orderStatus = "paid";
            break;

        case "pending":
            orderStatus = "pending";
            break;

        case "deny":
        case "cancel":
            orderStatus = "cancelled";
            break;

        case "expire":
            orderStatus = "expired";
            break;

        case "failure":
            orderStatus = "cancelled";
            break;

    }

    await orderRepository.updateOrderStatus(connection, orderId, orderStatus);

    if (orderStatus === "paid") {

        const details = await orderRepository.getOrderDetails(orderId);

        for (const detail of details) {
            for (let i = 0; i < detail.quantity; i++) {

                const ticketCode = generateTicketCode();

                await ticketRepository.createTicket(
                    connection,
                    {
                        order_detail_id: detail.id,
                        ticket_code: ticketCode,
                        status: "active"
                    }
                );

            }
        }

    }

    return orderStatus;

};


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
            redirect_url: existingPayment.redirect_url
        };
    }

    // =========================
    // Panggil Midtrans DI LUAR transaksi DB — ini request jaringan ke
    // server Midtrans yang bisa makan waktu, jangan sampai nge-hold
    // koneksi database selama itu.
    // =========================

    const transaction = await midtrans.createTransaction({
        orderId: order.invoice_number,
        grossAmount: order.final_price,
        customerDetails: {
            first_name: order.username,
            email: order.email,
            phone: order.phone || undefined,
        },
        // Midtrans akan redirect ke sini + query ?order_id=...&status_code=...&transaction_status=...
        // setelah customer selesai/batal/pending di halaman Snap.
        finishRedirectUrl: `${process.env.FRONTEND_URL}/customer/payment/finish`,
    });

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
                    redirect_url: transaction.redirect_url
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
                        redirect_url: racedPayment.redirect_url
                    };
                }

            }

            throw insertErr;

        }

        await connection.commit();

        return {
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

    if (!midtrans.verifySignature(body)) {
        throw new AppError("Signature tidak valid", 401);
    }

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        const payment = await paymentRepository.getPaymentByExternalId(body.order_id);

        if (!payment) {
            throw new AppError("Payment tidak ditemukan", 404);
        }

        const order = await orderRepository.getOrderById(payment.order_id);

        if (!order) {
            throw new AppError("Order tidak ditemukan", 404);
        }

        // Idempotency guard: order sudah final, tidak perlu diproses ulang
        if (order.status === "paid") {
            await connection.commit();
            return;
        }

        await applyTransactionStatus(connection, payment.order_id, body);

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

// Fallback manual: cek status langsung ke Midtrans (Core API) kalau
// notifikasi belum/tidak sampai (misal saat development dan tunnel ngrok
// belum tersambung benar).
export const checkPaymentStatus = async (userId, userRole, orderId) => {

    const payment = await getPayment(userId, userRole, orderId);

    if (payment.order_status === "paid") {
        return { order_status: payment.order_status };
    }

    // =========================
    // Panggil Core API Midtrans DI LUAR try/catch transaksi DB. Kalau
    // Midtrans belum sempat mencatat transaksinya (delay propagasi di
    // Sandbox antara Dashboard dan Core API), dia balikin 404 "Transaction
    // doesn't exist" — tangkap di sini supaya jadi pesan yang jelas ke
    // frontend, bukan 500 mentah dari unhandled exception.
    // =========================

    let statusData;

    try {

        statusData = await midtrans.getTransactionStatus(payment.midtrans_order_id);

    } catch (err) {

        if (err.httpStatusCode === "404") {
            throw new AppError(
                "Transaksi belum tercatat di Midtrans, coba lagi beberapa saat",
                404
            );
        }

        throw err;

    }

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        const freshOrder = await orderRepository.getOrderById(orderId);

        if (freshOrder.status === "paid") {
            await connection.commit();
            return { order_status: freshOrder.status };
        }

        const orderStatus = await applyTransactionStatus(connection, orderId, statusData);

        await connection.commit();

        return { order_status: orderStatus };

    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }

};
