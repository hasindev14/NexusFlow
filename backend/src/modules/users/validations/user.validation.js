import Joi from "joi";

export const updateProfileSchema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50),

    lastName: Joi.string()
        .trim()
        .min(2)
        .max(50),

    avatar: Joi.string()
        .uri()
        .allow(null, ""),
}).min(1);