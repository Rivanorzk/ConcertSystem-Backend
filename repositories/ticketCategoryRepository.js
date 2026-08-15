import db from "../lib/database.js";

export const getTicketCategories = async () => {
    const [rows] = await db.query(`
        SELECT
            id,
            category_name,
            price,
            created_at,
            updated_at
        FROM ticket_categories
        ORDER BY created_at DESC
    `);

    return rows;
};

export const getTicketCategoryById = async (id) => {
    const [rows] = await db.query(`
        SELECT
            id,
            category_name,
            price,
            created_at,
            updated_at
        FROM ticket_categories
        WHERE id = ?
        LIMIT 1
    `, [id]);

    return rows[0];
};

export const createTicketCategory = async (data) => {
    const [result] = await db.query(`
        INSERT INTO ticket_categories (
            category_name,
            price
        )
        VALUES (?, ?)
    `, [
        data.category_name,
        data.price,
    ]);

    return getTicketCategoryById(result.insertId);
};

export const updateTicketCategory = async (id, data) => {
    await db.query(`
        UPDATE ticket_categories
        SET
            category_name = ?,
            price = ?
        WHERE id = ?
    `, [
        data.category_name,
        data.price,
        id,
    ]);

    return getTicketCategoryById(id);
};

export const deleteTicketCategory = async (id) => {
    const [result] = await db.query(`
        DELETE FROM ticket_categories
        WHERE id = ?
    `, [id]);

    return result.affectedRows > 0;
};