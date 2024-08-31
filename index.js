import express from "express";
import { config } from "dotenv";

import { globaleResponse } from "./src/Middlewares/error-handling.middleware.js";
import db_connection from "./DB/connection.js";
import * as router from './src/Modules/index.js'

config();
 
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/categories',router.categoryRouter)
app.use('/sub-categories',router.subCategoryRouter)
app.use('/brands',router.brandRouter)
app.use('/products',router.productRouter)
app.use('/users',router.userRouter)
app.use('/users',router.userRouter)
app.use('/addresses',router.addressRouter)
app.use('/carts',router.cartRouter)

app.use(globaleResponse)

db_connection();

app.get("/", (req, res) => res.send("Hello E commerce!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
