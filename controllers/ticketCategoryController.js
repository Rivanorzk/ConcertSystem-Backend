import asyncHandler from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

import * as ticketCategoryService from "../services/ticketCategoryService.js";

export const getTicketCategories = asyncHandler(async (req, res) => {
    const categories =
        await ticketCategoryService.getTicketCategories();

    return success(res, categories);
});

export const getTicketCategoryById = asyncHandler(async (req, res) => {
    const category =
        await ticketCategoryService.getTicketCategoryById(
            req.params.id
        );

    return success(res, category);
});

export const createTicketCategory = asyncHandler(async (req, res) => {
    const category =
        await ticketCategoryService.createTicketCategory(
            req.body
        );

    return success(
        res,
        category,
        "Kategori tiket berhasil dibuat",
        201
    );
});

export const updateTicketCategory = asyncHandler(async (req, res) => {
    const category =
        await ticketCategoryService.updateTicketCategory(
            req.params.id,
            req.body
        );

    return success(
        res,
        category,
        "Kategori tiket berhasil diperbarui"
    );
});

export const deleteTicketCategory = asyncHandler(async (req, res) => {
    await ticketCategoryService.deleteTicketCategory(
        req.params.id
    );

    return success(
        res,
        null,
        "Kategori tiket berhasil dihapus"
    );
});