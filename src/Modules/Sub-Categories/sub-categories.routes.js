import { Router } from "express";

import *  as controller from './sub-categories.controller.js'

import { errorHandler, getDocumentByName, multerHost } from "../../Middlewares/index.js"
import { extensions } from "../../Utils/index.js";
import { SubCategory } from "../../../DB/Models/index.js";


const subCategoryRouter = Router();

// routes
subCategoryRouter.post('/create',
    multerHost({allowedExtensions:extensions.Images}).single('image'),
    getDocumentByName(SubCategory),
    errorHandler(controller.createSubCategory))

subCategoryRouter.get('/list',errorHandler(controller.getSubCategory))

subCategoryRouter.put('/update/:_id',
    multerHost({allowedExtensions:extensions.Images}).single('image'),
    getDocumentByName(SubCategory),
    errorHandler(controller.updateSubCategory))

subCategoryRouter.delete('/delete/:_id',errorHandler(controller.deleteSubCategory))
export { subCategoryRouter };
