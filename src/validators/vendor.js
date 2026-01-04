import Joi from 'joi';

export const createVendorSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    address: Joi.string().optional(),
    phone: Joi.string().optional(),
}).required();

export const updateVendorSchema = Joi.object({
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    phone: Joi.string().optional(),
}).required();

export const authenticateVendorSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
}).required();

