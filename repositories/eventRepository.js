import db from "../lib/database.js";

export async function findAll({
    search = "",
    category = "", // Ini akan berisi ID kategori
    sort = "latest",
} = {}) {
    let sql = `
        SELECT
            e.id,
            e.admin_id,
            e.category_id,
            c.category_name,
            e.title,
            e.description,
            e.location,
            e.poster,
            e.event_date,
            e.start_time,
            e.status,
            e.latitude,
            e.longitude,
            e.created_at,
            e.updated_at,

            MIN(etc.price) AS price

        FROM events e

        LEFT JOIN categories c
            ON c.id = e.category_id

        LEFT JOIN event_ticket_categories etc
            ON etc.event_id = e.id

        WHERE 1 = 1
    `;

    const values = [];

    // ✅ HANYA TAMPILKAN EVENT DENGAN STATUS PUBLISHED
    sql += ` AND e.status = 'published' `;

    if (search) {
        sql += `
            AND (
                e.title LIKE ?
                OR e.location LIKE ?
                OR c.category_name LIKE ?
            )
        `;

        const keyword = `%${search}%`;

        values.push(keyword, keyword, keyword);
    }

    // ✅ PERBAIKAN: Filter berdasarkan ID, bukan nama
    if (category && category !== "All") {
        sql += ` AND e.category_id = ? `; // ← Perbaikan di sini
        values.push(category); // Kirim ID kategori
    }

    sql += `
        GROUP BY
            e.id,
            e.admin_id,
            e.category_id,
            c.category_name,
            e.title,
            e.description,
            e.location,
            e.poster,
            e.event_date,
            e.start_time,
            e.status,
            e.latitude,
            e.longitude,
            e.created_at,
            e.updated_at
    `;

    switch (sort) {
        case "latest":
            sql += ` ORDER BY e.created_at DESC `;
            break;
        case "oldest":
            sql += ` ORDER BY e.created_at ASC `;
            break;
        case "date":
            sql += ` ORDER BY e.event_date ASC `;
            break;
        default:
            sql += ` ORDER BY e.created_at DESC `;
    }

    console.log('SQL Query:', sql); // Debug
    console.log('Values:', values); // Debug

    const [rows] = await db.query(sql, values);
    
    console.log('Found events:', rows.length); // Debug

    return rows;
}

export const findById = async (id) => {
    const [rows] = await db.query(
        `
        SELECT
            e.*,
            c.category_name,

            u.id AS admin_user_id,
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
            latitude,
            longitude,
            poster,
            event_date,
            start_time,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.admin_id,
            data.category_id,
            data.title,
            data.description,
            data.location,
            data.latitude,
            data.longitude,
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
            latitude = ?,
            longitude = ?,
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
            data.latitude,
            data.longitude,
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