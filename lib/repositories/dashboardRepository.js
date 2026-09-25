import db from "../../config/database.js";

// =====================================================
// CUSTOMER (PRD 25)
//   Total Order, Order Pending, Order Berhasil, Total Tiket
// =====================================================
export const getCustomerStats = async (customerId) => {

    const [[orderStats]] = await db.query(
        `
        SELECT
            COUNT(*) AS total_order,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)
                AS order_pending,
            SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)
                AS order_berhasil
        FROM orders
        WHERE customer_id = ?
        `,
        [customerId]
    );

    const [[ticketStats]] = await db.query(
        `
        SELECT
            COUNT(*) AS total_tiket
        FROM tickets t
        JOIN order_details od
            ON t.order_detail_id = od.id
        JOIN orders o
            ON od.order_id = o.id
        WHERE o.customer_id = ?
        `,
        [customerId]
    );

    return {
        total_order: Number(orderStats?.total_order || 0),
        order_pending: Number(orderStats?.order_pending || 0),
        order_berhasil: Number(orderStats?.order_berhasil || 0),
        total_tiket: Number(ticketStats?.total_tiket || 0),
    };

};

// =====================================================
// ADMIN (PRD 26)
//   Total Event, Total Tiket Terjual, Total Transaksi,
//   Transaksi Berhasil, Pendapatan
//   -> hanya untuk event milik admin ybs (events.admin_id)
// =====================================================
export const getAdminStats = async (adminId) => {

    const [[eventStats]] = await db.query(
        `
        SELECT COUNT(*) AS total_event
        FROM events
        WHERE admin_id = ?
        `,
        [adminId]
    );

    const [[orderStats]] = await db.query(
        `
        SELECT
            COUNT(*) AS total_transaksi,
            SUM(CASE WHEN o.status = 'paid' THEN 1 ELSE 0 END)
                AS transaksi_berhasil,
            SUM(CASE WHEN o.status = 'paid' THEN o.final_price ELSE 0 END)
                AS pendapatan
        FROM orders o
        JOIN events e
            ON o.event_id = e.id
        WHERE e.admin_id = ?
        `,
        [adminId]
    );

    const [[ticketStats]] = await db.query(
        `
        SELECT
            COALESCE(SUM(od.quantity), 0) AS total_tiket_terjual
        FROM order_details od
        JOIN orders o
            ON od.order_id = o.id
        JOIN events e
            ON o.event_id = e.id
        WHERE e.admin_id = ?
            AND o.status = 'paid'
        `,
        [adminId]
    );

    return {
        total_event: Number(eventStats?.total_event || 0),
        total_tiket_terjual: Number(ticketStats?.total_tiket_terjual || 0),
        total_transaksi: Number(orderStats?.total_transaksi || 0),
        transaksi_berhasil: Number(orderStats?.transaksi_berhasil || 0),
        pendapatan: Number(orderStats?.pendapatan || 0),
    };

};

// =====================================================
// SUPERADMIN (PRD 27)
//   Total Customer, Total Admin, Total Event,
//   Total Tiket Terjual, Total Transaksi, Total Pendapatan
//   -> seluruh sistem
// =====================================================
export const getSuperadminStats = async () => {

    const [[userStats]] = await db.query(
        `
        SELECT
            SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END)
                AS total_customer,
            SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END)
                AS total_admin
        FROM users
        `
    );

    const [[eventStats]] = await db.query(
        `SELECT COUNT(*) AS total_event FROM events`
    );

    const [[orderStats]] = await db.query(
        `
        SELECT
            COUNT(*) AS total_transaksi,
            SUM(CASE WHEN status = 'paid' THEN final_price ELSE 0 END)
                AS total_pendapatan
        FROM orders
        `
    );

    const [[ticketStats]] = await db.query(
        `
        SELECT
            COALESCE(SUM(od.quantity), 0) AS total_tiket_terjual
        FROM order_details od
        JOIN orders o
            ON od.order_id = o.id
        WHERE o.status = 'paid'
        `
    );

    return {
        total_customer: Number(userStats?.total_customer || 0),
        total_admin: Number(userStats?.total_admin || 0),
        total_event: Number(eventStats?.total_event || 0),
        total_tiket_terjual: Number(ticketStats?.total_tiket_terjual || 0),
        total_transaksi: Number(orderStats?.total_transaksi || 0),
        total_pendapatan: Number(orderStats?.total_pendapatan || 0),
    };

};
