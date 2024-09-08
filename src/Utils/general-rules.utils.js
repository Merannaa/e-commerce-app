import Joi from "joi"
import mongoose from "mongoose"

const objectValidation = (value,helper)=>{
    const isvalid= mongoose.isValidObjectId(value)
    if(!isvalid){
        return helper.message('invalid object id')
    }
    return value
}
export const generalRules ={
    _id:Joi.string().custom(objectValidation)
}