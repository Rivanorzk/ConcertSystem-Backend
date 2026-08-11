import db from "../lib/database.js";

export const getOrders = async () => {

    const [rows] = await db.query(`
        SELECT
            o.*,
            u.username,
            e.title AS event_title
        FROM orders o
        JOIN users u
            ON o.customer_id = u.id
        JOIN events e
            ON o.event_id = e.id
        ORDER BY o.created_at DESC
    `);

    return rows;

};

export const getMyOrders = async (customerId) => {

    const [rows] = await db.query(
        `
        SELECT
            o.*,
            e.title AS event_title
        FROM orders o
        JOIN events e
            ON o.event_id = e.id
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC
        `,
        [customerId]
    );

    return rows;

};

export const getOrderById = async (id) => {

    const [rows] = await db.query(
        `
        SELECT *
        FROM orders
        WHERE id = ?
        `,
        [id]
    );

    return rows[0];

};

export const getOrderWithCustomer = async (id) => {

    const [rows] = await db.query(
        `
        SELECT
            o.*,
            u.username,
            u.email,
            u.phone
        FROM orders o
        JOIN users u
            ON o.customer_id = u.id
        WHERE o.id = ?
        `,
        [id]
    );

    return rows[0];

};

export const getOrderDetails = async (orderId) => {

    const [rows] = await db.query(
        `
        SELECT
            od.*,
            tc.category_name
        FROM order_details od
        JOIN ticket_categories tc
            ON od.ticket_category_id = tc.id
        WHERE od.order_id = ?
        `,
        [orderId]
    );

    return rows;

};

export const createOrder = async (
    connection,
    data
) => {

    const [result] = await connection.query(
        `
        INSERT INTO orders (
            event_id,
            customer_id,
            voucher_id,
            invoice_number,
            total_price,
            discount_amount,
            final_price,
            status,
            expired_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.event_id,
            data.customer_id,
            data.voucher_id,
            data.invoice_number,
            data.total_price,
            data.discount_amount,
            data.final_price,
            data.status,
            data.expired_at
        ]
    );

    return result.insertId;

};

export const createOrderDetail = async (
    connection,
    data
) => {

    await connection.query(
        `
        INSERT INTO order_details (
            order_id,
            ticket_category_id,
            quantity,
            price,
            subtotal
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            data.order_id,
            data.ticket_category_id,
            data.quantity,
            data.price,
            data.subtotal
        ]
    );

};

export const updateOrderStatus = async (
    connection,
    id,
    status
) => {

    await connection.query(
        `
        UPDATE orders
        SET status = ?
        WHERE id = ?
        `,
        [
            status,
            id
        ]
    );

};

export const deleteOrder = async (
    connection,
    id
) => {

    await connection.query(
        `
        DELETE FROM orders
        WHERE id = ?
        `,
        [id]
    );

};


