import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import checkRole from "../middleware/checkRole.js";

import {
    getCustomerDashboard,
    getAdminDashboard,
    getSuperadminDashboard,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get(
    "/customer",
    authMiddleware,
    checkRole("customer"),
    getCustomerDashboard
);

router.get(
    "/admin",
    authMiddleware,
    checkRole("admin", "superadmin"),
    getAdminDashboard
);

router.get(
    "/superadmin",
    authMiddleware,
    checkRole("superadmin"),
    getSuperadminDashboard
);

export default router;
