import { Coupon, couponChangeLog, User } from "../../../DB/Models/index.js"
import { ErrorClass } from "../../Utils/index.js"


/**
 * @api {POST} /coupons/create   create coupon
 */
    export const createCoupon= async(req,res,next)=>{
        const {couponCode, couponAmount,from,till,couponType,Users} =req.body

        //coupon code check
        const isCouponCodeExist= await Coupon.findOne({couponCode})
        if(isCouponCodeExist){
            return next(new ErrorClass('coupon code is already exist',400))
        }

        const userIds = Users.map(user=>user.userId) //array of user ids
        const vaildUser = await User.find({_id:{$in:userIds}})
        if(vaildUser.length !== userIds.length){
            return next(new ErrorClass('invalid User',400))
        }

        //create coupon
        const newCoupon = new Coupon({
            couponCode, couponAmount,from,till,couponType,Users,
            createdBy:req.authUser._id
        })

        await newCoupon.save()
        res.status(201).json({message:'coupon created',
            coupon: newCoupon
        })
    }

/**
 * @api {GET} /coupons  get all coupons
 */
    export const getCoupons = async (req,res,next)=>{
        const {isEnabled}= req.query
        const filters ={}

        if(isEnabled){
            filters.isEnabled = isEnabled === 'true' ? true : false
        }
        const coupons = await Coupon.find(filters)
        res.status(200).json({message:'coupons', coupons})
        
    }

/**
 * @api {GET} /coupons/:couponId  get coupon by id
 */
    export const getCouponById = async (req,res,next)=>{
        const {couponId} = req.params
        const coupon = await Coupon.findById({couponId})
        if(!coupon){
            return next(new ErrorClass('coupon not found',404))
        }
        res.status(200).json({message:'coupon founded', coupon})
    }

/**
 * @api {PUT} /coupons/:couponId  update coupon by id
 */
    export const updateCoupon = async(req,res,next)=>{
        const {couponId} = req.params
        const userId = req.authUser._id
        const {couponCode, from, till, couponAmount, couponType, Users} = req.body

        const coupon = await Coupon.findById(couponId)
        if(!coupon){
            return next(new ErrorClass('coupon not found',404))
        }

        const logUpdatedObject = {couponId, updatedBy:userId, changes:{}}
        if(couponCode){
            const isCouponCodeExist = await Coupon.findOne({couponCode})
            if(isCouponCodeExist){
                return next(new ErrorClass('coupon code is already exists',400))
            }
            coupon.couponCode=couponCode
            logUpdatedObject.changes.couponCode=couponCode
        }
        if(from){
            coupon.from = from
            logUpdatedObject.changes.from = from
        }

        if(till){
            coupon.till = till
            logUpdatedObject.changes.till = till
        }

        if(couponAmount){
            coupon.couponAmount = couponAmount
            logUpdatedObject.changes.couponAmount = couponAmount
        }

        if(couponType){
            coupon.couponType = couponType
            logUpdatedObject.changes.couponType = couponType
        }

        if(Users){
            const userIds = Users.map(user=>user.userId) //array of user ids
            const vaildUser = await User.find({_id:{$in:userIds}})
            if(vaildUser.length !== userIds.length){
            return next(new ErrorClass('invalid User',400))
        }
        coupon.Users = Users
            logUpdatedObject.changes.Users = Users
        }

        await coupon.save()

        //save log in db
        const log = await new couponChangeLog(logUpdatedObject).save()

        res.status(200).json({message:'coupon updated',coupon,log})
    }

/**
 * @api {PATCH} /coupons/:couponId  update coupon disable or enable
 */
    export const disableEnableCoupon = async (req,res,next)=>{
        const {couponId} = req.params
        const userId = req.authUser._id
        const {enable} = req.body

        const coupon = await Coupon.findById(couponId)
        if(!coupon){
            return next(new ErrorClass('coupon not found',404))
        }

        const logUpdatedObject = {couponId, updatedBy:userId, changes:{}} 

        if(enable === true){
            coupon.isEnabled = true
            logUpdatedObject.changes.isEnabled = true
        }
        if(enable === false){
            coupon.isEnabled = false
            logUpdatedObject.changes.isEnabled = false
        }
        await coupon.save()
        const log = await new couponChangeLog(logUpdatedObject).save()
        res.status(200).json({message:'coupon updated',coupon,log})
    }
/**
 * @api {DELETE} /coupons/:couponId  delete coupon by id
 */