import { Router } from "express";

import *  as controller from './review.controller.js'

import { errorHandler,auth, validationMiddleware } from "../../Middlewares/index.js"

const reviewRoute = Router();

// routes

reviewRoute.post('/add',auth(),errorHandler(controller.addReview))
reviewRoute.get('/',auth(["user"]),errorHandler(controller.listReview))
reviewRoute.put('/approve-reject/:reviewId',auth(["admin"]),errorHandler(controller.approveOrRejectReview))


export { reviewRoute };