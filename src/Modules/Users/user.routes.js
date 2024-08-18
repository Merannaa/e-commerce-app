import { Router } from "express";
import { User} from "../../../DB/Models/index.js";
import * as controller from './user.controller.js'
import {errorHandler} from '../../Middlewares/index.js'


const userRouter = Router();

// routes

userRouter.post('/register',errorHandler(controller.signup))
userRouter.patch('/update/:userId',errorHandler(controller.updateUser))

export { userRouter };