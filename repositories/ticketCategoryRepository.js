import db from "../lib/database.js";

export const getTicketCategories = async () => {

    const [rows] = await db.query(`
        SELECT
            tc.*,
            e.title AS event_title
        FROM ticket_categories tc
        LEFT JOIN events e
            ON tc.event_id = e.id
        ORDER BY tc.created_at DESC
    `);

    return rows;

};

export const getTicketCategoryById = async (id) => {

    const [rows] = await db.query(
        `
        SELECT *
        FROM ticket_categories
        WHERE id = ?
        `,
        [id]
    );

    return rows[0];

};

export const getTicketCategoriesByEvent = async (eventId) => {

    const [rows] = await db.query(
        `
        SELECT *
        FROM ticket_categories
        WHERE event_id = ?
        ORDER BY price ASC
        `,
        [eventId]
    );

    return rows;

};

export const createTicketCategory = async (data) => {

    const [result] = await db.query(
        `
        INSERT INTO ticket_categories (
            event_id,
            category_name,
            price,
            stock,
            remaining_stock,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            data.event_id,
            data.category_name,
            data.price,
            data.stock,
            data.stock,
            data.description
        ]
    );

    return result.insertId;

};

export const updateTicketCategory = async (id, data) => {

    await db.query(
        `
        UPDATE ticket_categories
        SET
            category_name = ?,
            price = ?,
            stock = ?,
            remaining_stock = ?,
            description = ?
        WHERE id = ?
        `,
        [
            data.category_name,
            data.price,
            data.stock,
            data.remaining_stock,
            data.description,
            id
        ]
    );

};

export const deleteTicketCategory = async (id) => {

    await db.query(
        `
        DELETE FROM ticket_categories
        WHERE id = ?
        `,
        [id]
    );

};

export const updateRemainingStock = async (
    connection,
    id,
    quantity
) => {

    await connection.query(
        `
        UPDATE ticket_categories
        SET remaining_stock = remaining_stock - ?
        WHERE id = ?
        `,
        [quantity, id]
    );

};

export const getTicketCategoryByIdForUpdate = async (
    connection,
    id
) => {

    const [rows] = await connection.query(
        `
        SELECT
            id,
            category_name,
            price,
            remaining_stock
        FROM ticket_categories
        WHERE id = ?
        FOR UPDATE
        `,
        [id]
    );

    return rows[0];

};

export const increaseRemainingStock = async (
    connection,
    id,
    quantity
) => {

    await connection.query(
        `
        UPDATE ticket_categories
        SET remaining_stock = remaining_stock + ?
        WHERE id = ?
        `,
        [quantity, id]
    );

};
