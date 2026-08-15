import * as service from "../services/eventTicketCategoryService.js";

export const getEventTicketCategories = async (req, res) => {
    const data = await service.getEventTicketCategories(
        req.params.eventId
    );

    res.json({
        success: true,
        data,
    });
};

export const getEventTicketCategoryById = async (req, res) => {
    const data = await service.getEventTicketCategoryById(
        req.params.id
    );

    res.json({
        success: true,
        data,
    });
};

export const createEventTicketCategory = async (req, res) => {
    const data = await service.createEventTicketCategory(req.body);

    res.status(201).json({
        success: true,
        message: "Event ticket category created successfully",
        data,
    });
};

export const updateEventTicketCategory = async (req, res) => {
    const data = await service.updateEventTicketCategory(
        req.params.id,
        req.body
    );

    res.json({
        success: true,
        message: "Event ticket category updated successfully",
        data,
    });
};

export const deleteEventTicketCategory = async (req, res) => {
    await service.deleteEventTicketCategory(req.params.id);

    res.json({
        success: true,
        message: "Event ticket category deleted successfully",
    });
};