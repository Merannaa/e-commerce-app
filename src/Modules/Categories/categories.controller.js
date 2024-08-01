import { nanoid } from 'nanoid'
import {cloudinaryConfig, ErrorClass, uploadFile} from '../../Utils/index.js'

import slugify from "slugify"
import { Category } from '../../../DB/Models/index.js'

/**
 * @api {POST} /categories/create add  category
 */

export const createCategory = async(req,res,next)=>{
    //destruct data from req.body
    const {name}=req.body


    //generate slug
    const slug = slugify(name,{
        replacement:"_",
        lower:true
    })

    //Image
    if(!req.file){
        return next(new ErrorClass('Please upload an image',400,'Please upload an image') )
    }

    //generate name of category folder by nanoid
    const customId = nanoid(4)
    
    //upload image on cloudinary
    const {secure_url, public_id} = await cloudinaryConfig().uploader.upload(req.file.path,{
        folder:`${process.env.UPLOADS_FOLDER}/Categories/${customId}`
    })

    //prepare category object
    const category ={
        name,
        slug,
        Images:{
            secure_url,
            public_id
        },
        customId
    }

    //create category in database
    const newCategory = await Category.create(category)

    //send response
    res.status(201).json({
        status:'success',
        message:'Category created successfully',
        data:newCategory
    })
}

/**
 * @api {GET} /categories/   get category by id,name,slug
 */
export const getCategory = async(req,res,next)=>{
    //data in query
    const {id,name,slug} = req.query

    //object to push data
    const queryFilter = {}
    if(id) queryFilter._id = id;
    if(name) queryFilter.name = name;
    if(slug) queryFilter.slug = slug;

    const category = await Category.findOne(queryFilter)

    if (!category) {
        return next(new ErrorClass('category not found',404,'category not found'))
    }

    //response
    res.status(200).json({
        status: 'success',
        message:'category found',
        data:category
    })
}

/**
 * @api {PUT} /categories/update/:id    update category 
 */

export const updateCategory = async (req,res,next)=>{
    //find category by id in params
    const {_id}= req.params;

    const category = await Category.findById(_id)
    if(!category){
        return next(new ErrorClass('category not found',400,'category not found'))
    }
    //data in body
    const {name} = req.body;
    //if name come we have to generate new slug
    if(name){
        const slug = slugify(name,{
            replacement:'_',
            lower:true
        })
        category.name = name;
        category.slug = slug;
    }

    //update image
    if(req.file){
        const splitedPublicId= category.Images.public_id.split(`${category.customId}/`)[1];
        const {secure_url} = await uploadFile({
            file: req.file.path,
            folder:`${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`,
            publicId:splitedPublicId,
        })

        // console.log({public_id});

        category.Images.secure_url=secure_url
    }

    await category.save()

    res.status(200).json({
        status:'success',
        message:'category updated successfully',
        data:category
    })
}

/**
 * @api {DELETE} /categories/delete/:_id   delete category 
 */

export const deleteCategory = async (req,res,next)=>{
    const {_id}=req.params;

    const category = await Category.findByIdAndDelete(_id)
    if(!category){
        return next(new ErrorClass('category not found',404,'category not found'))
    }
    
    //path folder
    const categoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`;

    await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath)
    await cloudinaryConfig().api.delete_folder(categoryPath)

    res.status(200).json({
        status:'success',
        message:'category deleted sucessfully',
        data:category
    })
}