import Joi from "joi";

export const createTicketCategorySchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    category_name: Joi.string().min(2).required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).required(),
    description: Joi.string().allow("", null)
});

export const updateTicketCategorySchema = Joi.object({
    category_name: Joi.string().min(2),
    price: Joi.number().min(0),
    stock: Joi.number().integer().min(0),
    remaining_stock: Joi.number().integer().min(0),
    description: Joi.string().allow("", null)
}).min(1);
