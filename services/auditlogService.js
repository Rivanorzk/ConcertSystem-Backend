import * as auditLogRepository from "../repositories/auditlogRepository.js";

/**
 * Dipanggil dari controller lain (voucher, ticket category, user) setiap
 * kali ada aksi sensitif yang dilakukan. `actor` adalah req.user dari
 * authMiddleware.
 */
export const logActivity = async ({
    actor,
    action,
    entityType,
    entityId,
    description,
}) => {
    try {
        await auditLogRepository.create({
            actorId: actor?.id ?? null,
            actorUsername: actor?.username ?? "unknown",
            actorRole: actor?.role ?? "unknown",
            action,
            entityType,
            entityId,
            description,
        });
    } catch (error) {
        // Audit log tidak boleh sampai menggagalkan aksi utama,
        // jadi error di sini cukup dicatat ke console saja.
        console.error("Failed to write audit log:", error);
    }
};

export const getAuditLogs = async (queryParams) => {
    const { action, entity_type, page, limit } = queryParams;

    return await auditLogRepository.findAll({
        action,
        entityType: entity_type,
        page,
        limit,
    });
};