import * as dashboardRepository from "../repositories/dashboardRepository.js";

export const getCustomerDashboard = async (customerId) => {
    return await dashboardRepository.getCustomerStats(customerId);
};

export const getAdminDashboard = async (adminId, period) => {
    return await dashboardRepository.getAdminStats(adminId, period);
};

export const getSuperadminDashboard = async () => {
    return await dashboardRepository.getSuperadminStats();
};