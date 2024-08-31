import { Router } from "express";

import *  as controller from './address.controller.js'

import { errorHandler,auth } from "../../Middlewares/index.js"

const addressRouter = Router();

// routes
addressRouter.post('/add',errorHandler(controller.addAdress))
addressRouter.put('/edit/:addressId',auth(),errorHandler(controller.updateAddress))
addressRouter.put('/remove/:addressId',auth(),errorHandler(controller.deletAddress))
addressRouter.get('/',auth(),errorHandler(controller.getAddresses))

export { addressRouter };