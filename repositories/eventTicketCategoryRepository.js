import db from "../lib/database.js";

export const findByEventId = async (eventId) => {
    const [rows] = await db.query(`
        SELECT
            etc.id,
            etc.event_id,
            etc.ticket_category_id,
            etc.stock,
            etc.remaining_stock,
            tc.category_name,
            tc.price
        FROM event_ticket_categories etc
        JOIN ticket_categories tc
            ON etc.ticket_category_id = tc.id
        WHERE etc.event_id = ?
        ORDER BY tc.price ASC
    `, [eventId]);

    return rows;
};

export const findById = async (id) => {
    const [rows] = await db.query(`
        SELECT
            etc.*,
            tc.category_name,
            tc.price
        FROM event_ticket_categories etc
        JOIN ticket_categories tc
            ON etc.ticket_category_id = tc.id
        WHERE etc.id = ?
        LIMIT 1
    `, [id]);

    return rows[0];
};

export const create = async (
    connection,
    {
        event_id,
        ticket_category_id,
        stock,
    }
) => {
    const [result] = await connection.query(`
        INSERT INTO event_ticket_categories (
            event_id,
            ticket_category_id,
            stock,
            remaining_stock
        )
        VALUES (?, ?, ?, ?)
    `, [
        event_id,
        ticket_category_id,
        stock,
        stock,
    ]);

    return result.insertId;
};

export const removeByEventId = async (
    connection,
    eventId
) => {
    await connection.query(`
        DELETE FROM event_ticket_categories
        WHERE event_id = ?
    `, [eventId]);
};

export const remove = async (
    connection,
    id
) => {
    await connection.query(`
        DELETE FROM event_ticket_categories
        WHERE id = ?
    `, [id]);
};

export const updateStock = async (
    connection,
    id,
    stock,
    remainingStock
) => {
    await connection.query(`
        UPDATE event_ticket_categories
        SET
            stock = ?,
            remaining_stock = ?
        WHERE id = ?
    `, [
        stock,
        remainingStock,
        id,
    ]);
};

export const decreaseStock = async (
    connection,
    id,
    quantity
) => {
    const [result] = await connection.query(`
        UPDATE event_ticket_categories
        SET remaining_stock = remaining_stock - ?
        WHERE id = ?
          AND remaining_stock >= ?
    `, [
        quantity,
        id,
        quantity,
    ]);

    return result.affectedRows > 0;
};

export const increaseStock = async (
    connection,
    id,
    quantity
) => {
    await connection.query(`
        UPDATE event_ticket_categories
        SET remaining_stock = remaining_stock + ?
        WHERE id = ?
    `, [
        quantity,
        id,
    ]);
};