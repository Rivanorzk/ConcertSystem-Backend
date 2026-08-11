import AppError from "../utils/AppError.js";

import * as ticketCategoryRepository from "../repositories/ticketCategoryRepository.js";

export const getTicketCategories = async () => {

    return await ticketCategoryRepository.getTicketCategories();

};

export const getTicketCategoryById = async (id) => {

    const category =
        await ticketCategoryRepository.getTicketCategoryById(id);

    if (!category) {
        throw new AppError(
            "Kategori tiket tidak ditemukan",
            404
        );
    }

    return category;

};

export const getTicketCategoriesByEvent = async (eventId) => {

    return await ticketCategoryRepository.getTicketCategoriesByEvent(eventId);

};

export const createTicketCategory = async (body) => {

    const id =
        await ticketCategoryRepository.createTicketCategory(body);

    return await ticketCategoryRepository.getTicketCategoryById(id);

};

export const updateTicketCategory = async (id, body) => {

    const category =
        await ticketCategoryRepository.getTicketCategoryById(id);

    if (!category) {
        throw new AppError(
            "Kategori tiket tidak ditemukan",
            404
        );
    }

    await ticketCategoryRepository.updateTicketCategory(id, body);

    return await ticketCategoryRepository.getTicketCategoryById(id);

};

export const deleteTicketCategory = async (id) => {

    const category =
        await ticketCategoryRepository.getTicketCategoryById(id);

    if (!category) {
        throw new AppError(
            "Kategori tiket tidak ditemukan",
            404
        );
    }

    await ticketCategoryRepository.deleteTicketCategory(id);

};