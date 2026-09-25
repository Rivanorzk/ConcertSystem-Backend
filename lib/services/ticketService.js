import QRCode from "qrcode";

import AppError from "../utils/AppError.js";

import * as ticketRepository from "../repositories/ticketRepository.js";

export const getTickets = async () => {

    return await ticketRepository.getTickets();

};

export const getMyTickets = async (userId) => {

    return await ticketRepository.getMyTickets(userId);

};

export const getTicketById = async (id, userId, userRole) => {

    const ticket =
        await ticketRepository.getTicketById(id);

    if (!ticket) {
        throw new AppError(
            "Tiket tidak ditemukan",
            404
        );
    }

    const isOwner = ticket.customer_id === userId;
    const isStaff = ["admin", "superadmin"].includes(userRole);

    if (!isOwner && !isStaff) {
        throw new AppError("Anda tidak memiliki akses ke tiket ini", 403);
    }

    const qrCode =
        await QRCode.toDataURL(ticket.ticket_code);

    return {
        ...ticket,
        qr_code: qrCode
    };

};