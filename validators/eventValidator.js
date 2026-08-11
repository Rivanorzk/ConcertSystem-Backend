import Joi from "joi";

export const createEventSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().allow("", null),
    location: Joi.string().required(),
    poster: Joi.string().allow("", null),
    event_date: Joi.date().required(),
    start_time: Joi.string().required(),
    status: Joi.string().valid("upcoming", "ongoing", "finished", "cancelled").default("upcoming")
});

export const updateEventSchema = Joi.object({
    title: Joi.string().min(3),
    description: Joi.string().allow("", null),
    location: Joi.string(),
    poster: Joi.string().allow("", null),
    event_date: Joi.date(),
    start_time: Joi.string(),
    status: Joi.string().valid("upcoming", "ongoing", "finished", "cancelled")
}).min(1);
