import Joi from "joi";

export const createOrganizationSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    description: Joi.string()
        .trim()
        .max(500)
        .allow("")
        .default(""),
});

export const updateOrganizationSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100),

    description: Joi.string()
        .trim()
        .max(500)
        .allow(""),
}).min(1);

export const addMemberSchema = Joi.object({
    userId: Joi.string()
        .hex()
        .length(24)
        .required(),

    role: Joi.string()
        .valid("ADMIN", "MEMBER")
        .default("MEMBER"),
});