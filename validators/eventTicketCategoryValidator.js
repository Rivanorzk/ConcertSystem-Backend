import Joi from "joi";

export const createEventTicketCategorySchema = Joi.object({
    event_id: Joi.number()
        .integer()
        .positive()
        .required(),

    ticket_category_id: Joi.number()
        .integer()
        .positive()
        .required(),

    stock: Joi.number()
        .integer()
        .min(0)
        .required()
});

export const updateEventTicketCategorySchema = Joi.object({
    stock: Joi.number()
        .integer()
        .min(0)
        .required()
});