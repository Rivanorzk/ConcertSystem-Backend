import * as dashboardRepository from "../repositories/dashboardRepository.js";

export const getCustomerDashboard = async (customerId) => {
    return await dashboardRepository.getCustomerStats(customerId);
};

export const getAdminDashboard = async (adminId) => {
    return await dashboardRepository.getAdminStats(adminId);
};

export const getSuperadminDashboard = async () => {
    return await dashboardRepository.getSuperadminStats();
};
