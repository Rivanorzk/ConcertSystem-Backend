import asyncHandler from "../lib/utils/asyncHandler.js";
import { success } from "../lib/utils/response.js";
import * as dashboardService from "../lib/services/dashboardService.js";

export const getCustomerDashboard = asyncHandler(async (req, res) => {

    const stats = await dashboardService.getCustomerDashboard(
        req.user.id
    );

    return success(res, stats);

});

export const getAdminDashboard = asyncHandler(async (req, res) => {

    // Superadmin yang mengintip endpoint admin akan melihat statistik
    // sistem secara keseluruhan, bukan error, supaya tetap berguna
    // kalau dipakai lintas role.
    const stats = req.user.role === "superadmin"
        ? await dashboardService.getSuperadminDashboard()
        : await dashboardService.getAdminDashboard(req.user.id);

    return success(res, stats);

});

export const getSuperadminDashboard = asyncHandler(async (req, res) => {

    const stats = await dashboardService.getSuperadminDashboard();

    return success(res, stats);

});
