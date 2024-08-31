import { Router } from "express";

import *  as controller from './cart.controller.js'

import { errorHandler,auth } from "../../Middlewares/index.js"

const cartRouter = Router();

// routes
cartRouter.post('/add/:productId',auth(),errorHandler(controller.addToCart))
cartRouter.put('/remove/:productId',auth(),errorHandler(controller.removeFromCart))
cartRouter.put('/update/:productId',auth(),errorHandler(controller.updateCart))
cartRouter.get('/',auth(),errorHandler(controller.getCart))

export { cartRouter };