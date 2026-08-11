import db from "../lib/database.js";

export const createRedemption = async (
    connection,
    data
) => {

    const [result] = await connection.query(
        `
        INSERT INTO redemption_logs (
            ticket_id,
            admin_id,
            redeemed_at,
            notes
        )
        VALUES (?, ?, NOW(), ?)
        `,
        [
            data.ticket_id,
            data.admin_id,
            data.notes
        ]
    );

    return result.insertId;

};

export const getRedemptions = async () => {

    const [rows] = await db.query(
        `
        SELECT
            rl.id,
            rl.redeemed_at,
            rl.notes,
            t.ticket_code,
            u.username AS admin_name
        FROM redemption_logs rl
        JOIN tickets t
            ON rl.ticket_id = t.id
        JOIN users u
            ON rl.admin_id = u.id
        ORDER BY rl.redeemed_at DESC
        `
    );

    return rows;

};

export const getRedemptionById = async (id) => {

    const [rows] = await db.query(
        `
        SELECT
            rl.*,
            t.ticket_code,
            u.username AS admin_name
        FROM redemption_logs rl
        JOIN tickets t
            ON rl.ticket_id = t.id
        JOIN users u
            ON rl.admin_id = u.id
        WHERE rl.id = ?
        `,
        [id]
    );

    return rows[0];

};