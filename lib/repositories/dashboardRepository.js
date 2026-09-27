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
        JOIN events e
            ON o.event_id = e.id
        WHERE o.customer_id = ?
            AND t.status = 'active'
            AND e.status != 'cancelled'
            AND TIMESTAMP(e.event_date, e.start_time) >= NOW()
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

    const [[quotaStats]] = await db.query(
        `
        SELECT
            COALESCE(SUM(etc.stock), 0) AS tickets_quota
        FROM event_ticket_categories etc
        JOIN events e
            ON etc.event_id = e.id
        WHERE e.admin_id = ?
        `,
        [adminId]
    );

    const [[checkinStats]] = await db.query(
        `
        SELECT
            COUNT(*) AS checked_in
        FROM tickets t
        JOIN order_details od
            ON t.order_detail_id = od.id
        JOIN orders o
            ON od.order_id = o.id
        JOIN events e
            ON o.event_id = e.id
        WHERE e.admin_id = ?
            AND t.status = 'used'
        `,
        [adminId]
    );

    const events = await getAdminEventsSummary(adminId);

    return {
        total_event: Number(eventStats?.total_event || 0),
        total_tiket_terjual: Number(ticketStats?.total_tiket_terjual || 0),
        total_transaksi: Number(orderStats?.total_transaksi || 0),
        transaksi_berhasil: Number(orderStats?.transaksi_berhasil || 0),
        pendapatan: Number(orderStats?.pendapatan || 0),

        // Alias & field tambahan, dibutuhkan oleh dashboard EO
        // (app/eo/dashboard/page.js).
        total_sales: Number(orderStats?.pendapatan || 0),
        tickets_sold: Number(ticketStats?.total_tiket_terjual || 0),
        tickets_quota: Number(quotaStats?.tickets_quota || 0),
        checked_in: Number(checkinStats?.checked_in || 0),

        // Daftar event milik admin ini sendiri, lengkap dengan kuota,
        // tiket terjual, dan omzet kotor per event — dipakai section
        // "Event Konser Aktif" di dashboard EO.
        events,

        // Belum ada tabel refund/support-case atau gate-scanner di skema
        // database saat ini, jadi sementara distub kosong/0 supaya UI
        // tidak error. Kalau fitur ini mau benar-benar live, perlu tabel
        // baru (mis. support_cases, gates) + endpoint CRUD-nya.
        support_cases: 0,
        gates: [],
    };

};

// Event milik admin tertentu + agregat kuota/terjual/omzet, dipakai
// untuk panel "Event Konser Aktif" di dashboard EO. Pakai correlated
// subquery (bukan JOIN + GROUP BY) supaya tidak fan-out saat sebuah
// event punya banyak kategori tiket / banyak order.
export const getAdminEventsSummary = async (adminId) => {
    const [rows] = await db.query(
        `
        SELECT
            e.id,
            e.admin_id,
            e.category_id,
            c.category_name,
            e.title,
            e.location,
            e.poster,
            e.event_date,
            e.start_time,
            e.status,

            (
                SELECT COALESCE(SUM(etc.stock), 0)
                FROM event_ticket_categories etc
                WHERE etc.event_id = e.id
            ) AS quota,

            (
                SELECT COALESCE(SUM(od.quantity), 0)
                FROM order_details od
                JOIN orders o ON od.order_id = o.id
                WHERE o.event_id = e.id
                    AND o.status = 'paid'
            ) AS tickets_sold,

            (
                SELECT COALESCE(SUM(o.final_price), 0)
                FROM orders o
                WHERE o.event_id = e.id
                    AND o.status = 'paid'
            ) AS gross_revenue

        FROM events e
        LEFT JOIN categories c
            ON c.id = e.category_id
        WHERE e.admin_id = ?
        ORDER BY e.created_at DESC
        `,
        [adminId]
    );

    return rows.map((row) => ({
        ...row,
        quota: Number(row.quota || 0),
        tickets_sold: Number(row.tickets_sold || 0),
        gross_revenue: Number(row.gross_revenue || 0),
    }));
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