import Joi from "joi";

export const createTicketCategorySchema = Joi.object({
    category_name: Joi.string()
        .min(2)
        .required(),

    price: Joi.number()
        .min(0)
        .required(),
});

export const updateTicketCategorySchema = Joi.object({
    category_name: Joi.string()
        .min(2),

    price: Joi.number()
        .min(0),
}).min(1);