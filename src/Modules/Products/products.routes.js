import { Router } from "express";

import * as controller from './products.controller.js'

import { checkIdExist, errorHandler, getDocumentByName, multerHost } from "../../Middlewares/index.js"

import { extensions } from "../../Utils/index.js";

import { Brand, Product } from "../../../DB/Models/index.js";


const productRouter = Router();

// routes
productRouter.post('/add',
    multerHost({allowedExtensions:extensions.Images}).array('image',5),
    getDocumentByName(Product),
    checkIdExist(Brand),
    errorHandler(controller.addProduct))

productRouter.put('/update/:productId',
    errorHandler(controller.updateProduct))

productRouter.get('/list',errorHandler(controller.listProducts))


productRouter.get('/list',errorHandler(controller.listProducts))
export { productRouter };

