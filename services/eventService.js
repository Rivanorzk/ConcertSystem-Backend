import AppError from "../utils/AppError.js";
import * as eventRepository from "../repositories/eventRepository.js";

// Di eventService.js, pastikan data category_id dikembalikan sebagai number
export async function getEvents(params = {}) {
    try {
        const events = await eventRepository.findAll(params);
        
        // Pastikan category_id adalah number
        return events.map(event => ({
            ...event,
            category_id: Number(event.category_id),
            price: Number(event.price) || 0
        }));
    } catch (error) {
        console.error('Error getting events:', error);
        throw error;
    }
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