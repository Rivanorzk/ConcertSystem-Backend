import db from "../lib/database.js";

import AppError from "../utils/AppError.js";

import * as ticketRepository from "../repositories/ticketRepository.js";
import * as redemptionRepository from "../repositories/redemptionRepository.js";

export const redeemTicket = async (
    adminId,
    body
) => {

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        const ticket =
            await ticketRepository.getTicketByCode(
                connection,
                body.ticket_code
            );

        if (!ticket) {
            throw new AppError(
                "Tiket tidak ditemukan",
                404
            );
        }

        if (ticket.status === "used") {
            throw new AppError(
                "Tiket sudah digunakan",
                400
            );
        }

        if (ticket.status !== "active") {
            throw new AppError(
                "Tiket tidak valid",
                400
            );
        }

        await ticketRepository.updateTicketStatus(
            connection,
            ticket.id,
            "used"
        );

        await redemptionRepository.createRedemption(
            connection,
            {
                ticket_id: ticket.id,
                admin_id: adminId,
                notes: body.notes
            }
        );

        await connection.commit();

        return {
            ticket_code: ticket.ticket_code,
            status: "used"
        };

    } catch (err) {

        await connection.rollback();

        throw err;

    } finally {

        connection.release();

    }

};

export const getRedemptions = async () => {

    return await redemptionRepository.getRedemptions();

};

export const getRedemptionById = async (id) => {

    const redemption =
        await redemptionRepository.getRedemptionById(id);

    if (!redemption) {
        throw new AppError(
            "Data redemption tidak ditemukan",
            404
        );
    }

    return redemption;

};