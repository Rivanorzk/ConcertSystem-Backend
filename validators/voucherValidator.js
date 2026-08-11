import Joi from "joi";

export const createVoucherSchema = Joi.object({
    event_id: Joi.number().integer().positive().allow(null),
    title: Joi.string().min(3).required(),
    minimum_ticket: Joi.number().integer().min(1).default(1),
    promo_code: Joi.string().alphanum().min(3).required(),
    discount_type: Joi.string().valid("percentage", "fixed").required(),
    discount_value: Joi.number().positive().required(),
    quota: Joi.number().integer().min(1).required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref("start_date")).required()
});

export const updateVoucherSchema = Joi.object({
    title: Joi.string().min(3),
    minimum_ticket: Joi.number().integer().min(1),
    promo_code: Joi.string().alphanum().min(3),
    discount_type: Joi.string().valid("percentage", "fixed"),
    discount_value: Joi.number().positive(),
    quota: Joi.number().integer().min(1),
    start_date: Joi.date(),
    end_date: Joi.date(),
    status: Joi.string()
}).min(1);

export const validateVoucherSchema = Joi.object({
    promo_code: Joi.string().required(),
    total_ticket: Joi.number().integer().min(1)
});
