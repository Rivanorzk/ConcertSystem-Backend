import db from "../lib/database.js";

export const findAll = async () => {
    const [rows] = await db.query(`
        SELECT
            etc.id,
            etc.event_id,
            etc.ticket_category_id,
            etc.stock,
            etc.remaining_stock,
            etc.created_at,
            etc.updated_at,

            e.title AS event_title,
            tc.category_name

        FROM event_ticket_categories etc

        INNER JOIN events e
            ON etc.event_id = e.id

        INNER JOIN ticket_categories tc
            ON etc.ticket_category_id = tc.id

        ORDER BY etc.created_at DESC
    `);

    return rows;
};

export const findById = async (id) => {
    const [rows] = await db.query(`
        SELECT
            etc.id,
            etc.event_id,
            etc.ticket_category_id,
            etc.stock,
            etc.remaining_stock,
            etc.created_at,
            etc.updated_at,

            e.title AS event_title,
            tc.category_name

        FROM event_ticket_categories etc

        INNER JOIN events e
            ON etc.event_id = e.id

        INNER JOIN ticket_categories tc
            ON etc.ticket_category_id = tc.id

        WHERE etc.id = ?
        LIMIT 1
    `, [id]);

    return rows[0];
};

export const findByEvent = async (eventId) => {
    const [rows] = await db.query(`
        SELECT
            etc.id,
            etc.event_id,
            etc.ticket_category_id,
            etc.stock,
            etc.remaining_stock,

            tc.category_name

        FROM event_ticket_categories etc

        INNER JOIN ticket_categories tc
            ON etc.ticket_category_id = tc.id

        WHERE etc.event_id = ?

        ORDER BY tc.category_name ASC
    `, [eventId]);

    return rows;
};

export const findByEventAndCategory = async (
    eventId,
    ticketCategoryId
) => {
    const [rows] = await db.query(`
        SELECT
            *
        FROM event_ticket_categories
        WHERE event_id = ?
        AND ticket_category_id = ?
        LIMIT 1
    `, [
        eventId,
        ticketCategoryId
    ]);

    return rows[0];
};

export const create = async (data) => {
    const [result] = await db.query(`
        INSERT INTO event_ticket_categories (
            event_id,
            ticket_category_id,
            stock,
            remaining_stock
        )
        VALUES (?, ?, ?, ?)
    `, [
        data.event_id,
        data.ticket_category_id,
        data.stock,
        data.stock
    ]);

    return findById(result.insertId);
};

export const update = async (id, data) => {
    await db.query(`
        UPDATE event_ticket_categories
        SET
            stock = ?,
            remaining_stock = ?
        WHERE id = ?
    `, [
        data.stock,
        data.remaining_stock,
        id
    ]);

    return findById(id);
};

export const remove = async (id) => {
    const [result] = await db.query(`
        DELETE FROM event_ticket_categories
        WHERE id = ?
    `, [id]);

    return result.affectedRows > 0;
};

export const updateRemainingStock = async (
    connection,
    id,
    quantity
) => {
    await connection.query(`
        UPDATE event_ticket_categories
        SET remaining_stock = remaining_stock - ?
        WHERE id = ?
        AND remaining_stock >= ?
    `, [
        quantity,
        id,
        quantity
    ]);
};

export const increaseRemainingStock = async (
    connection,
    id,
    quantity
) => {
    await connection.query(`
        UPDATE event_ticket_categories
        SET remaining_stock = remaining_stock + ?
        WHERE id = ?
        AND remaining_stock + ? <= stock
    `, [
        quantity,
        id,
        quantity
    ]);
};

export const findByIdForUpdate = async (
    connection,
    id
) => {
    const [rows] = await connection.query(`
        SELECT
            id,
            event_id,
            ticket_category_id,
            stock,
            remaining_stock
        FROM event_ticket_categories
        WHERE id = ?
        FOR UPDATE
    `, [id]);

    return rows[0];
};