import express from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import checkRole from "../middlewares/checkRole.js";
import { getAuditLogs } from "../controllers/auditlogController.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    checkRole("superadmin"),
    getAuditLogs
);

export default router;