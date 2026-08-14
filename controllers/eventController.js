import asyncHandler from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import * as eventService from "../services/eventService.js";

export async function getEvents(req, res) {

    try {
        const events = await eventService.getEvents(req.query);

        res.json({
            success: true,
            message: "Success",
            data: events
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
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