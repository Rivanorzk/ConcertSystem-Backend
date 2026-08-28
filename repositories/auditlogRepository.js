import db from "../lib/database.js";

export const create = async ({
    actorId,
    actorUsername,
    actorRole,
    action,
    entityType,
    entityId,
    description,
}) => {
    const [result] = await db.query(`
        INSERT INTO audit_logs (
            actor_id,
            actor_username,
            actor_role,
            action,
            entity_type,
            entity_id,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        actorId,
        actorUsername,
        actorRole,
        action,
        entityType,
        entityId,
        description,
    ]);

    return result.insertId;
};

export const findAll = async ({
    action,
    entityType,
    page = 1,
    limit = 20,
} = {}) => {
    const conditions = [];
    const params = [];

    if (action) {
        conditions.push("action = ?");
        params.push(action);
    }

    if (entityType) {
        conditions.push("entity_type = ?");
        params.push(entityType);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const offset = (Number(page) - 1) * Number(limit);

    const [rows] = await db.query(`
        SELECT
            id,
            actor_id,
            actor_username,
            actor_role,
            action,
            entity_type,
            entity_id,
            description,
            created_at
        FROM audit_logs
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `, [...params, Number(limit), offset]);

    const [countRows] = await db.query(`
        SELECT COUNT(*) AS total
        FROM audit_logs
        ${whereClause}
    `, params);

    return {
        rows,
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit),
    };
};