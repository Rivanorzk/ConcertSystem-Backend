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

    // period: "month" (default, bulan kalender berjalan) atau "30d"
    // (30 hari terakhir) — dipakai untuk badge pertumbuhan penjualan,
    // sesuai toggle "Bulan Ini" / "30 Hari Terakhir" di dashboard EO.
    const period = req.query.period === "30d" ? "30d" : "month";

    // Superadmin yang mengintip endpoint admin akan melihat statistik
    // sistem secara keseluruhan, bukan error, supaya tetap berguna
    // kalau dipakai lintas role.
    const stats = req.user.role === "superadmin"
        ? await dashboardService.getSuperadminDashboard()
        : await dashboardService.getAdminDashboard(req.user.id, period);

    return success(res, stats);

});

export const getSuperadminDashboard = asyncHandler(async (req, res) => {

    const stats = await dashboardService.getSuperadminDashboard();

    return success(res, stats);

});