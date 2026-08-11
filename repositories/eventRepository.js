import db from "../lib/database.js";

export async function findAll({
    search = "",
    category = "",
    sort = "latest",
}) {
    let sql = `
        SELECT
            e.id,
            e.admin_id,
            e.category_id,
            e.title,
            e.description,
            e.location,
            e.poster,
            e.event_date,
            e.start_time,
            e.status,
            e.created_at,
            e.updated_at,
            c.category_name,
            c.icon AS category_icon,
            MIN(tc.price) AS lowest_price
        FROM events e

        LEFT JOIN categories c
            ON c.id = e.category_id

        LEFT JOIN ticket_categories tc
            ON tc.event_id = e.id

        WHERE 1 = 1
    `;

    const values = [];

    if (search) {
        sql += `
            AND (
                e.title LIKE ?
                OR e.location LIKE ?
            )
        `;

        values.push(
            `%${search}%`,
            `%${search}%`
        );
    }

    if (category) {
        sql += `
            AND e.category_id = ?
        `;

        values.push(category);
    }

    sql += `
        GROUP BY
            e.id,
            e.admin_id,
            e.category_id,
            e.title,
            e.description,
            e.location,
            e.poster,
            e.event_date,
            e.start_time,
            e.status,
            e.created_at,
            e.updated_at,
            c.category_name,
            c.icon
    `;

    switch (sort) {
        case "price-low":
            sql += `
                ORDER BY lowest_price ASC
            `;
            break;

        case "price-high":
            sql += `
                ORDER BY lowest_price DESC
            `;
            break;

        default:
            sql += `
                ORDER BY e.event_date ASC,
                         e.start_time ASC
            `;
            break;
    }

    const [rows] = await db.query(
        sql,
        values
    );

    return rows;
}

export const findById = async (id) => {
    const [rows] = await db.query(
        `
        SELECT
            e.id,
            e.admin_id,
            e.category_id,
            e.title,
            e.description,
            e.location,
            e.poster,
            e.event_date,
            e.start_time,
            e.status,
            e.created_at,
            e.updated_at,

            c.category_name,
            c.icon AS category_icon,

            u.username AS admin_username,
            u.email AS admin_email

        FROM events e

        LEFT JOIN categories c
            ON c.id = e.category_id

        LEFT JOIN users u
            ON e.admin_id = u.id

        WHERE e.id = ?
        `,
        [id]
    );

    return rows[0];
};

export const create = async (data) => {
    const [result] = await db.query(
        `
        INSERT INTO events (
            admin_id,
            category_id,
            title,
            description,
            location,
            poster,
            event_date,
            start_time,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.admin_id,
            data.category_id,
            data.title,
            data.description,
            data.location,
            data.poster,
            data.event_date,
            data.start_time,
            data.status,
        ]
    );

    return result.insertId;
};

export const update = async (id, data) => {
    await db.query(
        `
        UPDATE events
        SET
            category_id = ?,
            title = ?,
            description = ?,
            location = ?,
            poster = ?,
            event_date = ?,
            start_time = ?,
            status = ?,
            updated_at = NOW()
        WHERE id = ?
        `,
        [
            data.category_id,
            data.title,
            data.description,
            data.location,
            data.poster,
            data.event_date,
            data.start_time,
            data.status,
            id,
        ]
    );
};

export const remove = async (id) => {
    await db.query(
        `
        DELETE FROM events
        WHERE id = ?
        `,
        [id]
    );
};