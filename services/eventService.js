import AppError from "../utils/AppError.js";
import * as eventRepository from "../repositories/eventRepository.js";

// Di services/eventService.js (backend)
export async function getEvents(queryParams) {
    try {
        // Ekstrak parameter dari query
        const { search = "", category = "", sort = "latest" } = queryParams;
        
        // Panggil repository dengan parameter yang benar
        const events = await eventRepository.findAll({
            search,
            category, // Ini akan menjadi ID kategori
            sort
        });
        
        return events;
    } catch (error) {
        console.error('Error in eventService.getEvents:', error);
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