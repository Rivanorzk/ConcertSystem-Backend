import * as repository from "../repositories/eventTicketCategoryRepository.js";
import * as eventRepository from "../repositories/eventRepository.js";
import * as ticketCategoryRepository from "../repositories/ticketCategoryRepository.js";

export const getEventTicketCategories = async (req, res) => {
    try {
        const data = await repository.findAll();

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get event ticket categories error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get event ticket categories."
        });
    }
};

export const getEventTicketCategoriesByEvent = async (
    req,
    res
) => {
    try {
        const { eventId } = req.params;

        const data =
            await repository.findByEvent(eventId);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get event ticket categories by event error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get event ticket categories."
        });
    }
};

export const getEventTicketCategoryById = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const data =
            await repository.findById(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Event ticket category not found."
            });
        }

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get event ticket category error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get event ticket category."
        });
    }
};

export const createEventTicketCategory = async (
    req,
    res
) => {
    try {
        const {
            event_id,
            ticket_category_id,
            stock
        } = req.body;

        if (!event_id || !ticket_category_id) {
            return res.status(400).json({
                success: false,
                message: "Event and ticket category are required."
            });
        }

        if (
            stock === undefined ||
            stock === null ||
            Number(stock) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a valid number."
            });
        }

        const event =
            await eventRepository.findById(event_id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        const category =
            await ticketCategoryRepository.findById(
                ticket_category_id
            );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Ticket category not found."
            });
        }

        const existing =
            await repository.findByEventAndCategory(
                event_id,
                ticket_category_id
            );

        if (existing) {
            return res.status(409).json({
                success: false,
                message:
                    "This ticket category is already added to the event."
            });
        }

        const data =
            await repository.create({
                event_id,
                ticket_category_id,
                stock: Number(stock)
            });

        return res.status(201).json({
            success: true,
            message:
                "Ticket category added to event successfully.",
            data
        });
    } catch (error) {
        console.error(
            "Create event ticket category error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to add ticket category to event."
        });
    }
};

export const updateEventTicketCategory = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        const existing =
            await repository.findById(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Event ticket category not found."
            });
        }

        if (
            stock === undefined ||
            stock === null ||
            Number(stock) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a valid number."
            });
        }

        const sold =
            existing.stock -
            existing.remaining_stock;

        const newStock = Number(stock);

        if (newStock < sold) {
            return res.status(400).json({
                success: false,
                message:
                    "Stock cannot be lower than tickets already sold."
            });
        }

        const remainingStock =
            newStock - sold;

        const data =
            await repository.update(id, {
                stock: newStock,
                remaining_stock: remainingStock
            });

        return res.status(200).json({
            success: true,
            message:
                "Event ticket category updated successfully.",
            data
        });
    } catch (error) {
        console.error(
            "Update event ticket category error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update event ticket category."
        });
    }
};

export const deleteEventTicketCategory = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const existing =
            await repository.findById(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Event ticket category not found."
            });
        }

        await repository.remove(id);

        return res.status(200).json({
            success: true,
            message:
                "Event ticket category deleted successfully."
        });
    } catch (error) {
        console.error(
            "Delete event ticket category error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete event ticket category."
        });
    }
};