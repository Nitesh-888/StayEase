import Joi from "joi";

export const listingSchema = Joi.object({
    title : Joi.string().required(),
    price : Joi.number().required().min(0),
    description : Joi.string().allow(""),
    location : Joi.string().required(),
    country : Joi.string().required()
}).required()


export const reviewSchema = Joi.object({
    comment : Joi.string().required(),
    rating : Joi.number().required().min(1).max(5)
}).required();