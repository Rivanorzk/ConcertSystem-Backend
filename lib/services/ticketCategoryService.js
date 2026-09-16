import AppError from "../utils/AppError.js";

import * as ticketCategoryRepository
    from "../repositories/ticketCategoryRepository.js";

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

export const createTicketCategory = async (body) => {
    const categoryName = body.category_name?.trim();
    const price = Number(body.price);

    if (!categoryName) {
        throw new AppError(
            "Nama kategori tiket wajib diisi",
            400
        );
    }

    if (Number.isNaN(price) || price < 0) {
        throw new AppError(
            "Harga tiket tidak valid",
            400
        );
    }

    const existing =
        await ticketCategoryRepository.findByName(
            categoryName
        );

    if (existing) {
        throw new AppError(
            "Kategori tiket sudah ada",
            409
        );
    }

    const id =
        await ticketCategoryRepository.createTicketCategory({
            category_name: categoryName,
            price,
        });

    return await ticketCategoryRepository.getTicketCategoryById(
        id
    );
};

export const updateTicketCategory = async (
    id,
    body
) => {
    const category =
        await ticketCategoryRepository.getTicketCategoryById(
            id
        );

    if (!category) {
        throw new AppError(
            "Kategori tiket tidak ditemukan",
            404
        );
    }

    const categoryName = body.category_name?.trim();
    const price = Number(body.price);

    if (!categoryName) {
        throw new AppError(
            "Nama kategori tiket wajib diisi",
            400
        );
    }

    if (Number.isNaN(price) || price < 0) {
        throw new AppError(
            "Harga tiket tidak valid",
            400
        );
    }

    const existing =
        await ticketCategoryRepository.findByName(
            categoryName
        );

    if (
        existing &&
        Number(existing.id) !== Number(id)
    ) {
        throw new AppError(
            "Kategori tiket sudah ada",
            409
        );
    }

    await ticketCategoryRepository.updateTicketCategory(
        id,
        {
            category_name: categoryName,
            price,
        }
    );

    return await ticketCategoryRepository.getTicketCategoryById(
        id
    );
};

export const deleteTicketCategory = async (id) => {
    const category =
        await ticketCategoryRepository.getTicketCategoryById(
            id
        );

    if (!category) {
        throw new AppError(
            "Kategori tiket tidak ditemukan",
            404
        );
    }

    await ticketCategoryRepository.deleteTicketCategory(id);
};