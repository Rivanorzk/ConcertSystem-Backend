import Joi from "joi";

export const updateProfileSchema = Joi.object({
    username: Joi.string().min(3),
    email: Joi.string().email(),
    phone: Joi.string(),
    profile_image: Joi.string().allow("", null)
}).min(1);

export const updatePasswordSchema = Joi.object({
    password: Joi.string().min(8).required()
});

export const updateRoleSchema = Joi.object({
    role: Joi.string().valid("customer", "admin", "superadmin").required()
});

export const updateStatusSchema = Joi.object({
    status: Joi.string().required(),
    is_active: Joi.boolean().required()
});
