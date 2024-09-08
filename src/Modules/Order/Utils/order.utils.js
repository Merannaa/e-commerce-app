import { DateTime } from "luxon"

import { Coupon } from "../../../../DB/Models/index.js"

import { DiscountType } from "../../../Utils/index.js";

/**
 * 
 * @param {*} couponCode 
 * @param {*} userId 
 * @returns {message: string, error: Boolean, coupon: Object}
 */
export const validateCoupon = async(couponCode,userId)=>{
    //find couponCode
    const coupon = await Coupon.findOne({couponCode})
    if(!coupon){
        return {message:'invalid coupon code', error:true} // coupon:null
    }

    //check coupon is enabled or not
    if(!coupon.isEnabled || DateTime.now() > DateTime.fromJSDate(coupon.till)){
        return {message:'coupon is disabled',error:true}
    }

    //check coupon started or not
    if(DateTime.now() < DateTime.fromJSDate(coupon.from)){
        return {message:`coupon not started yet, will start ${coupon.from}`, error:true}
    }

    //check user is eligible to use coupon or not
    const isUserNotEligible = coupon.Users.some(u => u.userId.toString()!== userId.toString()||(u.userId.toString() === userId.toString() && u.maxCount <= u.usageCount))
    if(isUserNotEligible){
        return {message:'user is not eligible to use coupon',error:true}

    }
    return {message:'coupon you can use',error:false,coupon}
}


export const applyCoupon= (subTotal,coupon)=>{
    let total = subTotal
    const {couponAmount:discountAmount,couponType:discountType}=coupon
    if(discountAmount && discountType){
        if(discount.type == DiscountType.PERCENTAGE){
            total = subTotal - (subTotal * discount.amount /100);
        } else if(discount.type == DiscountType.FIXED) {
            if(discountAmount > subTotal){
                return total
            }
            total = subTotal- discount.amount;
        }
    }
    
    return total
}