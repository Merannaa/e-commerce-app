import { Router } from "express";

import *  as controller from './brand.controller.js'

import { errorHandler, getDocumentByName, multerHost } from "../../Middlewares/index.js"
import { extensions } from "../../Utils/index.js";
import { Brand } from "../../../DB/Models/index.js";
const brandRouter = Router();

// routes
brandRouter.post('/create',
    multerHost({allowedExtensions:extensions.Images}).single('image'),
    getDocumentByName(Brand),
    errorHandler(controller.createBrand))

brandRouter.get('/list',errorHandler(controller.getBrand))
brandRouter.put('/update/:_id',
        multerHost({allowedExtensions:extensions.Images}).single('image'),
    getDocumentByName(Brand),
        errorHandler(controller.updateBrand))

        brandRouter.delete('/delete/:_id',errorHandler(controller.deleteBrand))
export { brandRouter };
