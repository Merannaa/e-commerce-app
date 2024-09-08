import Joi from "joi";
import { generalRules, CouponTypes } from "../../Utils/index.js";


export const CreateCouponSchema={
    body:Joi.object({
        couponCode: Joi.string().required(),
        from:Joi.date().greater(Date.now()).required(),
        till:Joi.date().greater(Joi.ref('from')).required(),
        Users:Joi.array().items(Joi.object({
            userId:generalRules._id.required(),
            maxCount:Joi.number().min(1).required()
        })).required(),
        couponType:Joi.string().valid(...Object.values(CouponTypes)).required(),
        couponAmount:Joi.number().when('couponType',{
            is:Joi.string().valid(CouponTypes.Percentage),
            then:Joi.number().max(100).required()
        }).min(1).required().messages({
            'number.min': 'coupon amount must be greater than 0',
            'number.max': 'coupon amount must be less than 100',
        })
    })
}

export const UpdateCouponSchema ={
    body:Joi.object({
        couponCode: Joi.string().optional(),
        from:Joi.date().greater(Date.now()).optional(),
        till:Joi.date().greater(Joi.ref('from')).optional(),
        Users:Joi.array().items(Joi.object({
            userId:generalRules._id.optional(),
            maxCount:Joi.number().min(1).optional()
        })).optional(),
        couponType:Joi.string().valid(...Object.values(CouponTypes)).optional(),
        couponAmount:Joi.number().when('couponType',{
            is:Joi.string().valid(CouponTypes.Percentage),
            then:Joi.number().max(100).optional()
        }).min(1).optional().messages({
            'number.min': 'coupon amount must be greater than 0',
            'number.max': 'coupon amount must be less than 100',
        })
    }),
    params:Joi.object({
        couponId:generalRules._id.required(),
    }),
    authUser:Joi.object({
        _id: generalRules._id.required(),
    }).options({allowUnknown:true}),

}