import db from "../lib/database.js";

export const findAll = async () => {
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

export const findById = async (id) => {
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

export const findByName = async (categoryName) => {
    const [rows] = await db.query(`
        SELECT
            id,
            category_name,
            price
        FROM ticket_categories
        WHERE category_name = ?
        LIMIT 1
    `, [categoryName]);

    return rows[0];
};

export const create = async ({
    category_name,
    price,
}) => {
    const [result] = await db.query(`
        INSERT INTO ticket_categories (
            category_name,
            price
        )
        VALUES (?, ?)
    `, [
        category_name,
        price,
    ]);

    return findById(result.insertId);
};

export const update = async (
    id,
    {
        category_name,
        price,
    }
) => {
    await db.query(`
        UPDATE ticket_categories
        SET
            category_name = ?,
            price = ?
        WHERE id = ?
    `, [
        category_name,
        price,
        id,
    ]);

    return findById(id);
};

export const remove = async (id) => {
    const [result] = await db.query(`
        DELETE FROM ticket_categories
        WHERE id = ?
    `, [id]);

    return result.affectedRows > 0;
};