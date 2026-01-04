import Joi from 'joi';

export const createCustomerSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
}).required();

export const updateCustomerSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
}).required();

export const authenticateCustomerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
}).required();