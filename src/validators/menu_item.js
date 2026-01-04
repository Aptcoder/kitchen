import Joi from 'joi';

const menuItemSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().positive().required(),
    image: Joi.string().uri().required(),
});

export const createMenuItemsSchema = Joi.array().items(menuItemSchema).required();

export const updateMenuItemSchema = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    image: Joi.string().uri().optional(),
}).required();