import { Router } from "express";

import *  as controller from './order.controller.js'

import { errorHandler,auth, validationMiddleware } from "../../Middlewares/index.js"

const orderRouter = Router();

// routes

orderRouter.post('/create',auth(),errorHandler(controller.createOrder));
orderRouter.put('/canceled/:orderId',auth(),errorHandler(controller.cancelOrder))
orderRouter.put('/delivered/:orderId',auth(),errorHandler(controller.deliveredOrder))
orderRouter.get('/',auth(),errorHandler(controller.listOrders))




export { orderRouter };