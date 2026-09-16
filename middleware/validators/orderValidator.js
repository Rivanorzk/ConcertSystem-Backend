import Joi from "joi";

export const createOrderSchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    voucher_code: Joi.string().allow("", null),
    tickets: Joi.array().items(
        Joi.object({
            ticket_category_id: Joi.number().integer().positive().required(),
            quantity: Joi.number().integer().min(1).required()
        })
    ).min(1).required()
});
