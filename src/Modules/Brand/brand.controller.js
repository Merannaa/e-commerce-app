import { nanoid } from 'nanoid'
import {cloudinaryConfig, ErrorClass, uploadFile} from '../../Utils/index.js'

import slugify from "slugify"
import { Category, SubCategory,Brand } from '../../../DB/Models/index.js'


/**
 * @api {POST} /brands/create   add brand
 */

export const createBrand = async(req,res,next)=>{
    const {category, subCategory} = req.query;
    //check SubCategory name  which belong to Brands
    const isSubCategory = await SubCategory.findById({
        _id:subCategory,
        category:category
    }).populate("categoryId")

    if(!isSubCategory){
        return next(new ErrorClass('subCategory not found',404,'subCategory not found'))
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
        return next(new ErrorClass('please upload a logo',400,'please upload a logo'))
    }

    //generate customid file
    const customId = nanoid(4)
    //destruct image data
    const {secure_url,public_id} = await uploadFile({
        file:req.file.path,
        folder:`${process.env.UPLOADS_FOLDER}/Categories/${isSubCategory.categoryId.customId}/SubCategories/${isSubCategory.customId}/Brands/${customId}`
    })

    //prepare object
    const brandObj={
        name,
        slug,
        logo:{
            secure_url,
            public_id
        },
        customId,
        categoryId:isSubCategory.categoryId._id,
        subCategoryId:isSubCategory._id
    }

    //create brand
    const newBrand = await Brand.create(brandObj)

    res.status(200).json({
        status:'success',
        message:'brand created successfully',
        data:newBrand
    })
}

/**
 * @api {GET} /brands/list   get  brand
 */

export const getBrand = async (req,res,next)=>{
    const {id,name,slug} = req.query

    const queryFilter = {}

    if (id)queryFilter._id=id;
    if(name)queryFilter.name=name;
    if(slug)queryFilter.slug=slug;

    const brand = await Brand.findOne(queryFilter)

    if(!brand){
        return next(new ErrorClass('brand not found',404,'brand not found'))
    }

    res.status(200).json({
        status:'success',
        message:'brand found successfully',
        data:brand
    })
}

/**
 * @api {PUT} /brands/update/:_id   update brand
 */
export const updateBrand = async(req,res,next)=>{

        const {_id}=req.params

        const brand = await Brand.findById(_id).populate("categoryId").populate("subCategoryId")

        if(!brand){
            return next(new ErrorClass('brand not found',404,'brand not found'))
        }

        const {name}= req.body
        if(name){
            const slug = slugify(name,{
                replacement:'_',
                lower:true
            })
            brand.name=name,
            brand.slug=slug
        }

        if(req.file){
            const splitedPublicId = brand.logo.public_id.split(`${brand.customId}/`)[1];
            const{secure_url}= await uploadFile({
                file:req.file.path,
                folder:`${process.env.UPLOADS_FOLDER}/Categories/${brand.categoryId.customId}/SubCategories/${brand.subCategoryId.customId}/Brands/${brand.customId}`,
                publicId:splitedPublicId,
            })
            brand.logo.secure_url=secure_url
        }

        await brand.save()
        res.status(200).json({
            status:'success',
            message:'brand updated successfully',
            data:brand
        })
}

/**
 * @api {DELETE} /brands/delete/:_id   delete brands
 */

export const deleteBrand = async (req,res,next)=>{
    const {_id}=req.params;

    const brand = await Brand.findByIdAndDelete(_id).populate("categoryId").populate("subCategoryId")
    if(!brand){
        return next(new ErrorClass('brand not found',404,'brand not found'))
    }

    const brandPath = `${process.env.UPLOADS_FOLDER}/Categories/${brand.categoryId.customId}/SubCategories/${brand.subCategoryId.customId}/Brands/${brand.customId}`;
    await cloudinaryConfig().api.delete_resources_by_prefix(brandPath)
    await cloudinaryConfig().api.delete_folder(brandPath)

    res.status(200).json({
        status:'success',
        message:'brand deleted sucessfully',
        data:brand
    })
}