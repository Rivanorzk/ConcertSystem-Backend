import AppError from "../utils/AppError.js";
import * as eventRepository from "../repositories/eventRepository.js";

export async function getEvents(query) {

    return await eventRepository.findAll(query);

}

export const getEventById = async (id) => {

    const event = await eventRepository.findById(id);

    if (!event) {
        throw new AppError("Event tidak ditemukan", 404);
    }

    return event;

};

export const createEvent = async (adminId, body) => {

    const eventId = await eventRepository.create({
        ...body,
        admin_id: adminId
    });

    return eventRepository.findById(eventId);

};

export const updateEvent = async (id, body) => {

    const event = await eventRepository.findById(id);

    if (!event) {
        throw new AppError("Event tidak ditemukan", 404);
    }

    await eventRepository.update(id, body);

    return eventRepository.findById(id);

};

export const deleteEvent = async (id) => {

    const event = await eventRepository.findById(id);

    if (!event) {
        throw new AppError("Event tidak ditemukan", 404);
    }

    await eventRepository.remove(id);

};