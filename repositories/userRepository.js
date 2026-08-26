import db from "../lib/database.js";

export const findAll = async () => {

    const [rows] = await db.query(`
        SELECT
            id,
            username,
            email,
            phone,
            profile_image,
            role,
            status,
            is_active,
            created_at
        FROM users
        ORDER BY created_at DESC
    `);

    return rows;

};

export const findById = async (id) => {

    const [rows] = await db.query(
        `
        SELECT
            id,
            username,
            email,
            phone,
            profile_image,
            role,
            status,
            is_active,
            created_at
        FROM users
        WHERE id = ?
        `,
        [id]
    );

    return rows[0];

};

export const findByIdWithPassword = async (id) => {
    const [rows] = await db.query(
        `
        SELECT
            id,
            username,
            email,
            phone,
            profile_image,
            role,
            status,
            is_active,
            password, 
            created_at
        FROM users
        WHERE id = ?
        `,
        [id]
    );
    return rows[0];
};

export const updateProfile = async (id, data) => {

    await db.query(
        `
        UPDATE users
        SET
            username = ?,
            email = ?,
            phone = ?,
            profile_image = ?
        WHERE id = ?
        `,
        [
            data.username,
            data.email,
            data.phone,
            data.profile_image,
            id
        ]
    );

    return findById(id);

};

export const updatePassword = async (id, password) => {

    await db.query(
        `
        UPDATE users
        SET password = ?
        WHERE id = ?
        `,
        [password, id]
    );

};

export const updateRole = async (id, role) => {

    await db.query(
        `
        UPDATE users
        SET role = ?
        WHERE id = ?
        `,
        [role, id]
    );

    return findById(id);

};

export const updateStatus = async (id, status, isActive) => {

    await db.query(
        `
        UPDATE users
        SET
            status = ?,
            is_active = ?
        WHERE id = ?
        `,
        [
            status,
            isActive,
            id
        ]
    );

    return findById(id);

};

export const remove = async (id) => {

    await db.query(
        "DELETE FROM users WHERE id = ?",
        [id]
    );

};