import asyncHandler from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

import * as ticketService from "../services/ticketService.js";

export const getTickets = asyncHandler(async (req, res) => {

    const tickets =
        await ticketService.getTickets();

    return success(res, tickets);

});

export const getMyTickets = asyncHandler(async (req, res) => {

    const tickets =
        await ticketService.getMyTickets(
            req.user.id
        );

    return success(res, tickets);

});

export const getTicketById = asyncHandler(async (req, res) => {

    const ticket =
        await ticketService.getTicketById(
            req.params.id,
            req.user.id,
            req.user.role
        );

    return success(res, ticket);

});