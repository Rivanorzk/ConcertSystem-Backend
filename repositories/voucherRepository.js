import db from "../lib/database.js";

export const getVouchers = async () => {

    const [rows] = await db.query(`
        SELECT
            v.*,
            e.title AS event_title
        FROM vouchers v
        LEFT JOIN events e
            ON v.event_id = e.id
        ORDER BY v.created_at DESC
    `);

    return rows;

};

export const getVoucherById = async (id) => {

    const [rows] = await db.query(
        `
        SELECT *
        FROM vouchers
        WHERE id = ?
        `,
        [id]
    );

    return rows[0];

};

export const getVoucherByCode = async (
    connection,
    promoCode
) => {

    const [rows] = await connection.query(
        `
        SELECT
            id,
            minimum_ticket,
            promo_code,
            discount_type,
            discount_value,
            quota,
            used_quota,
            start_date,
            end_date,
            status
        FROM vouchers
        WHERE promo_code = ?
        FOR UPDATE
        `,
        [promoCode]
    );

    return rows[0];

};

export const createVoucher = async (data) => {

    const [result] = await db.query(
        `
        INSERT INTO vouchers (
            event_id,
            title,
            minimum_ticket,
            promo_code,
            discount_type,
            discount_value,
            quota,
            used_quota,
            start_date,
            end_date,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.event_id,
            data.title,
            data.minimum_ticket,
            data.promo_code,
            data.discount_type,
            data.discount_value,
            data.quota,
            0,
            data.start_date,
            data.end_date,
            "belum digunakan"
        ]
    );

    return result.insertId;

};

export const updateVoucher = async (id, data) => {

    await db.query(
        `
        UPDATE vouchers
        SET
            title = ?,
            minimum_ticket = ?,
            promo_code = ?,
            discount_type = ?,
            discount_value = ?,
            quota = ?,
            start_date = ?,
            end_date = ?,
            status = ?
        WHERE id = ?
        `,
        [
            data.title,
            data.minimum_ticket,
            data.promo_code,
            data.discount_type,
            data.discount_value,
            data.quota,
            data.start_date,
            data.end_date,
            data.status,
            id
        ]
    );

};

export const deleteVoucher = async (id) => {

    await db.query(
        `
        DELETE FROM vouchers
        WHERE id = ?
        `,
        [id]
    );

};

export const incrementUsedQuota = async (
    connection,
    id
) => {

    await connection.query(
        `
        UPDATE vouchers
        SET used_quota = used_quota + 1
        WHERE id = ?
        `,
        [id]
    );

};

export const decrementUsedQuota = async (
    connection,
    id
) => {

    await connection.query(
        `
        UPDATE vouchers
        SET used_quota = used_quota - 1
        WHERE id = ?
        `,
        [id]
    );

};