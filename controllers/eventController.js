import asyncHandler from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import * as eventService from "../services/eventService.js";

export async function getEvents(req, res) {
    try {
        console.log('Query params:', req.query); // Debug
        
        const events = await eventService.getEvents(req.query);
        
        console.log('Events found:', events?.length || 0); // Debug
        console.log('First event:', events?.[0]); // Debug
        
        res.json({
            success: true,
            message: "Success",
            data: events || []
        });
    } catch (err) {
        console.error('Error in getEvents controller:', err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch events",
            data: []
        });
    }
}

export const getEventById = asyncHandler(async (req, res) => {

    const event = await eventService.getEventById(req.params.id);

    return success(res, event);

});

export const createEvent = asyncHandler(async (req, res) => {
    const event = await eventService.createEvent(
        req.user.id,
        {
            ...req.body,
            poster: req.file?.path,
        }
    );

    return success(
        res,
        event,
        "Event berhasil dibuat",
        201
    );
});

export const updateEvent = asyncHandler(async (req, res) => {
    const event = await eventService.updateEvent(
        req.params.id,
        {
            ...req.body,
            ...(req.file
                ? { poster: req.file.path }
                : {}),
        }
    );

    return success(
        res,
        event,
        "Event berhasil diperbarui"
    );
});

export const deleteEvent = asyncHandler(async (req, res) => {

    await eventService.deleteEvent(req.params.id);

    return success(
        res,
        null,
        "Event berhasil dihapus"
    );

});