import { Order, Product, Review } from "../../../DB/Models/index.js"
import { OrderStatus, ReviewStatus } from "../../Utils/constants.utils.js"
import { ErrorClass } from "../../Utils/error-class.utils.js"


export const addReview = async(req,res,next)=>{

    const {productId, rate, body}=req.body

    //check if user already reviewed this product
        const isAlreadyReviewed = await Review.findOne({
            userId:req.authUser._id,
            productId
        })
        if(isAlreadyReviewed){
            return next(new ErrorClass('you already reviewed this product',400))
        }

    //check if product exists
        const product = await Product.findById(productId)
        if(!product){
            return next(new ErrorClass('product not found',404))
        }

    //check if user bought this product
        const isBought = await Order.findOne({
            userId:req.authUser._id,
            "products.productId":productId,
            orderStatus:OrderStatus.Delivered
        })

        if(!isBought){
            return next(new ErrorClass('you must buy this product first',400))
        }

    //make object review
    const review ={
        userId:req.authUser._id,
        productId,
        reviewRating:rate,
        reviewBody:body
    }
    //save in db
    const newReview = await Review.create(review)

    res.status(201).json({message:'review created successfully', newReview})
}

export const listReview = async(req,res,next)=>{

    const reviews =await Review.find().populate([
        {
            path:"userId",
            select:"username email -_id"
        },
        {
            path:"productId",
            select:"title rating -_id"
        }
    ])

    res.status(200).json({reviews})
}

export const approveOrRejectReview = async(req,res,next)=>{
    const {reviewId}=req.params
    const {accept, reject}=req.body

    if(accept && reject){
        return next(new ErrorClass('please select accept or reject',400))
    }

    const review = await Review.findByIdAndUpdate(reviewId,{
        reviewStatus: 
          accept ? ReviewStatus.Accepted 
        : reject ? ReviewStatus.Rejected 
        : ReviewStatus.Pending
    },{new:true})

    res.status(200).json({message:'review approved',review})
}

