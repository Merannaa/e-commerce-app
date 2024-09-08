import { Router } from "express";

import *  as controller from './order.controller.js'

import { errorHandler,auth, validationMiddleware } from "../../Middlewares/index.js"

const orderRouter = Router();

// routes

orderRouter.post('/create',auth(),errorHandler(controller.createOrder))




export { orderRouter };