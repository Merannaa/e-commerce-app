import { Router } from "express";

import *  as controller from './coupon.controller.js'

import { errorHandler,auth, validationMiddleware } from "../../Middlewares/index.js"
import { CreateCouponSchema, UpdateCouponSchema } from "./coupon.schema.js";

const couponRouter = Router();

// routes
couponRouter.post('/create',auth(),validationMiddleware(CreateCouponSchema),errorHandler(controller.createCoupon))
couponRouter.get('/',auth(),errorHandler(controller.getCoupons))
couponRouter.get('/:couponId',auth(),errorHandler(controller.getCouponById))
couponRouter.put('/update/:couponId',auth(),validationMiddleware(UpdateCouponSchema),errorHandler(controller.updateCoupon))
couponRouter.patch('/enable/:couponId',auth(),errorHandler(controller.disableEnableCoupon))





export { couponRouter };