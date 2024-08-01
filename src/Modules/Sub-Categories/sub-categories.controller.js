import { nanoid } from 'nanoid'
import {cloudinaryConfig, ErrorClass, uploadFile} from '../../Utils/index.js'

import slugify from "slugify"
import { Category, SubCategory } from '../../../DB/Models/index.js'


/**
 * @api {POST} /sub-categories/create   add  sub-category
 */

export const createSubCategory = async(req,res,next)=>{
    //check category name  which belong to subcategory
    const category = await Category.findById(req.query.categoryId)
    if(!category){
        return next(new ErrorClass('category not found',404,'category not found'))
    }

    //destruct data
    const {name}=req.body
    //generate slug
    const slug = slugify(name,{
        replacement:'_',
        lower:true
    })

    //image
    if(!req.file){
        return next(new ErrorClass('please upload an image',400,'please upload an image'))
    }

    //generate customid file
    const customId = nanoid(4)
    //destruct image data
    const {secure_url,public_id} = await uploadFile({
        file:req.file.path,
        folder:`${process.env.UPLOADS_FOLDER}/Categories/${category.customId}/SubCategories/${customId}`
    })

    //prepare object
    const subCategoryObj={
        name,
        slug,
        Images:{
            secure_url,
            public_id
        },
        customId,
        categoryId:category._id
    }

    //create subcategory
    const newSubCategory = await SubCategory.create(subCategoryObj)

    res.status(200).json({
        status:'success',
        message:'category created successfully',
        data:newSubCategory
    })
}

/**
 * @api {GET} /sub-categories/list   get  sub-category
 */

export const getSubCategory = async (req,res,next)=>{
    const {id,name,slug} = req.query

    const queryFilter = {}

    if (id)queryFilter._id=id;
    if(name)queryFilter.name=name;
    if(slug)queryFilter.slug=slug;

    const subCategory = await SubCategory.findOne(queryFilter)

    if(!subCategory){
        return next(new ErrorClass('subCategory not found',404,'subCategory not found'))
    }

    res.status(200).json({
        status:'success',
        message:'subCategory found successfully',
        data:subCategory
    })
}

/**
 * @api {PUT} /sub-categories/update/:_id   update sub-category
 */
export const updateSubCategory = async(req,res,next)=>{

        const {_id}=req.params

        const subCategory = await SubCategory.findById(_id).populate("categoryId")

        if(!subCategory){
            return next(new ErrorClass('subCategory not found',404,'subCategory not found'))
        }

        const {name}= req.body
        if(name){
            const slug = slugify(name,{
                replacement:'_',
                lower:true
            })
            subCategory.name=name,
            subCategory.slug=slug
        }

        if(req.file){
            const splitedPublicId = subCategory.Images.public_id.split(`${subCategory.customId}/`)[1];
            const{secure_url}= await uploadFile({
                file:req.file.path,
                folder:`${process.env.UPLOADS_FOLDER}/Categories/${subCategory.categoryId.customId}/SubCategories/${subCategory.customId}`,
                publicId:splitedPublicId,
            })
            subCategory.Images.secure_url=secure_url
        }

        await subCategory.save()
        res.status(200).json({
            status:'success',
            message:'subCategory updated successfully',
            data:subCategory
        })
}

/**
 * @api {DELETE} /sub-categories/delete/:_id   delete sub-category
 */

export const deleteSubCategory = async (req,res,next)=>{
    const {_id}=req.params;

    const subCategory = await SubCategory.findByIdAndDelete(_id).populate("categoryId")
    if(!subCategory){
        return next(new ErrorClass('subCategory not found',404,'subCategory not found'))
    }

    const subCategoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.categoryId.customId}/SubCategories/${subCategory.customId}`;
    await cloudinaryConfig().api.delete_resources_by_prefix(subCategoryPath)
    await cloudinaryConfig().api.delete_folder(subCategoryPath)

    res.status(200).json({
        status:'success',
        message:'subCategory deleted sucessfully',
        data:subCategory
    })
}