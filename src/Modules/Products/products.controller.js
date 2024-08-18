import { nanoid } from 'nanoid'

import slugify from 'slugify'

//utils
import { calculateProductPrice, ErrorClass, uploadFile} from '../../Utils/index.js'
//models
import {Product } from '../../../DB/Models/index.js'
import { ApiFeatures } from '../../Utils/api-features.utils.js'

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

/**
 * @api {PUT} /products/update/:productId  update product
 */

export const updateProduct = async (req,res,next)=>{
    //productId from param
    const {productId}=req.params

    //destruct from body
    const {title,stock,overview,badge,price,discountAmount,discountType,specs}=req.body

    //find product by id
    const product = await Product.findById(productId).
    populate("categoryId").
    populate("subCategoryId").
    populate("brandId")


    if(!product){
        return next(new ErrorClass('product not found',404))
    }

    if(title){
        product.title=title
        product.slug=slugify(title,{replacement:'_',lower:true})
    }
    if(stock) product.stock=stock
    if(overview) product.overview=overview
    if(badge) product.badges=badge

    if(price || discountAmount || discountType){
        const newPrice = price || product.price
        const discount ={}
        discount.amount = discountAmount || product.appliedDiscount.amount
        discount.type = discountType || product.appliedDiscount.type

        product.appliedPrice = calculateProductPrice(newPrice,discount)   

        product.price=newPrice
        product.appliedDiscount =discount
    }

    if(specs) product.specs=specs

    //TO DO
    if(req.file){
        const splitedPublicId =product.Images.public_id.split(`${product.customId}/`)[1];
        const{secure_url}= await uploadFile({
            file:req.file.path,
            folder:`${process.env.UPLOADS_FOLDER}/Categories/${product.categoryId.customId}/SubCategories/${product.subCategoryId.customId}/Brands/${product.brandId.customId}/Products/${product.customId}`,
            publicId:splitedPublicId,
        })
        product.Images.secure_url=secure_url
    }

    await product.save()
    res.status(200).json({
        status:'success',
        message:'product updated successfully',
        data:product
    })
}

/**
 * @api {GET} /products/list  list all products
 */

export const listProducts = async (req,res,next) =>{

    // const { page = 1, limit = 5, ...filters} =req.query
    // const skip=(page-1)*limit

    //apply filters
    
    // const filterString=JSON.stringify(filters)
    // const replacefilter= filterString.replaceAll(/lt|gt|lte|gte/g, (ele)=>`$${ele}`)
    // const parseFilter = JSON.parse(replacefilter)


    const { page = 1, limit = 5} =req.query
    const skip=(page-1)*limit


    //paginate way1
    // const products = await Product.find().
    // limit(limit).
    // skip(skip).
    // select('-Images -specs -categoryId -subCategoryId -brandId')


    // plugin way2
    const mongooseQuery =  Product.find()

    const apiFeaturesInstance = new ApiFeatures(mongooseQuery,req.query).pagination().sort().filters()

    // const products = await apiFeaturesInstance.mongooseQuery
    // const products = await Product.find().skip(0).limit(2).sort("price")


    // plugin way2
    const products = await Product.paginate(
        {
            appliedPrice:{$gte:20000}
        },
        {
            page,
            limit,
            select:'-Images -specs -categoryId -subCategoryId -brandId',
            sort:{appliedPrice:1}
        })
    res.status(200).json({
        status:'success',
        message:'product list',
        data:products
    })
}
//page  1   2    3      4 
//limit 50  50   50     50
//skip  0   50   100   150 (page-1)* limit

