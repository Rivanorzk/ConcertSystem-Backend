import asyncHandler from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

import * as auditLogService from "../services/auditlogService.js";

export const getAuditLogs = asyncHandler(async (req, res) => {

    const result = await auditLogService.getAuditLogs(req.query);

    return success(
        res,
        result,
        "Audit log retrieved successfully"
    );

});