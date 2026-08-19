import db from "../lib/database.js";

export const createTicket = async (
    connection,
    data
) => {
    const [result] = await connection.query(
        `
        INSERT INTO tickets (
            order_detail_id,
            ticket_code,
            status
        )
        VALUES (?, ?, ?)
        `,
        [
            data.order_detail_id,
            data.ticket_code,
            data.status
        ]
    );

    return result.insertId;
};

export const getTickets = async () => {
    const [rows] = await db.query(
        `
        SELECT
            t.id,
            t.ticket_code,
            t.status,
            t.created_at,

            e.title AS event_title,

            tc.category_name,

            u.username

        FROM tickets t

        JOIN order_details od
            ON t.order_detail_id = od.id

        JOIN orders o
            ON od.order_id = o.id

        JOIN events e
            ON o.event_id = e.id

        JOIN event_ticket_categories etc
            ON od.event_ticket_category_id = etc.id

        JOIN ticket_categories tc
            ON etc.ticket_category_id = tc.id

        JOIN users u
            ON o.customer_id = u.id

        ORDER BY t.created_at DESC
        `
    );

    return rows;
};

export const getMyTickets = async (
    userId
) => {
    const [rows] = await db.query(
        `
        SELECT
            t.id,
            t.ticket_code,
            t.status,

            e.title AS event_title,
            e.event_date,
            e.start_time,
            e.location,

            tc.category_name

        FROM tickets t

        JOIN order_details od
            ON t.order_detail_id = od.id

        JOIN orders o
            ON od.order_id = o.id

        JOIN events e
            ON o.event_id = e.id

        JOIN event_ticket_categories etc
            ON od.event_ticket_category_id = etc.id

        JOIN ticket_categories tc
            ON etc.ticket_category_id = tc.id

        WHERE o.customer_id = ?

        ORDER BY e.event_date ASC
        `,
        [userId]
    );

    return rows;
};

export const getTicketById = async (
    id
) => {
    const [rows] = await db.query(
        `
        SELECT
            t.*,

            o.customer_id,

            e.title AS event_title,
            e.event_date,
            e.start_time,
            e.location,

            tc.category_name

        FROM tickets t

        JOIN order_details od
            ON t.order_detail_id = od.id

        JOIN orders o
            ON od.order_id = o.id

        JOIN events e
            ON o.event_id = e.id

        JOIN event_ticket_categories etc
            ON od.event_ticket_category_id = etc.id

        JOIN ticket_categories tc
            ON etc.ticket_category_id = tc.id

        WHERE t.id = ?
        `,
        [id]
    );

    return rows[0];
};

export const getTicketByCode = async (
    connection,
    ticketCode
) => {
    const [rows] = await connection.query(
        `
        SELECT *
        FROM tickets
        WHERE ticket_code = ?
        FOR UPDATE
        `,
        [ticketCode]
    );

    return rows[0];
};

export const updateTicketStatus = async (
    connection,
    id,
    status
) => {
    await connection.query(
        `
        UPDATE tickets
        SET status = ?
        WHERE id = ?
        `,
        [
            status,
            id
        ]
    );
};

export const countTicketsByOrder = async (
    orderId
) => {
    const [rows] = await db.query(
        `
        SELECT
            COUNT(*) AS total

        FROM tickets t

        JOIN order_details od
            ON t.order_detail_id = od.id

        WHERE od.order_id = ?
        `,
        [orderId]
    );

    return rows[0].total;
};