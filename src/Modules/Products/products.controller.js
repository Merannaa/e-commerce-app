import { nanoid } from 'nanoid'
//utils
import { ErrorClass, uploadFile} from '../../Utils/index.js'
//models
import {Product } from '../../../DB/Models/index.js'

/**
 * @api {POST} /products/add   add product
 */

export const addProduct = async (req,res,next)=>{
    //destruct data body
    const{title,overview,specs,price,discountAmount,discountType,stock}=req.body
   
    //req.file
    if(!req.files.length){
        return next(new ErrorClass('no images uploaded',400,'no images uploaded'))
    }
    //check Id
    const brandDocument = req.document

    //Images -for loop to upload  photo on cloudinary
    const brandCustomId=brandDocument.customId
    const categoryCustomId=brandDocument.categoryId.customId
    const subCategoryCustomId=brandDocument.subCategoryId.customId
    const customId = nanoid(4)
    const folder = `${process.env.UPLOADS_FOLDER}/Categories/${categoryCustomId}/SubCategories/${subCategoryCustomId}/Brands/${brandCustomId}/Products/${customId}`;
    
    const URLs=[]
    for(const file of req.files){
        const {secure_url,public_id}=await uploadFile({
            file:file.path,
            folder
        })
        URLs.push({secure_url,public_id})
    }

    //prepare object
    const productObj={
        title,
        overview,
        specs:JSON.parse(specs),
        price,
        appliedDiscount:{
            amount:discountAmount,
            type:discountType
        },
        stock,
        Images:{
            URLs,
            customId
        },
        categoryId:brandDocument.categoryId._id,
        subCategoryId:brandDocument.subCategoryId._id,
        brandId:brandDocument._id

    }

    //create in db
    const newProduct = await Product.create(productObj)

    //response
    res.status(200).json({
        status:'success',
        message:'product added successfully',
        data:newProduct
    })
}