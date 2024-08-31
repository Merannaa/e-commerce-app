import { Cart, Product } from "../../../DB/Models/index.js"
import { ErrorClass } from "../../Utils/index.js"

import { checkProductAvaliability } from "./Utils/cart.utils.js"

/**
 * @api {POST} /carts/add  add-cart
 */
export const addToCart = async(req,res,next)=>{
    const userId = req.authUser._id
    const {quantity}=req.body
    const {productId}=req.params

    const product = await checkProductAvaliability(productId,quantity)
    if(!product){
        return next(new ErrorClass('product not available',404))
    }

    const cart = await Cart.findOne({userId})
    if(!cart){
        // const subTotal = product.appliedPrice * quantity
        const newCart = new Cart({
            userId,
            products:[{ productId: product._id , quantity, price:product.appliedPrice}],
        })
        await newCart.save()
        res.status(201).json({message:"product added to cart", cart: newCart})
    }

    const isProductExist = cart.products.find(p=> p.productId == productId)
    if(isProductExist){
        return next(new ErrorClass('product already in the cart',400))
    }
    cart.products.push({productId: product._id , quantity, price:product.appliedPrice})
    // cart.subTotal += product.appliedPrice * quantity

    await cart.save()
    res.status(201).json({message:"product added to cart", cart})

}

/**
 * @api {Put} /carts/update  delete from-cart
 */
export const updateCart = async (req,res,next)=>{
    const userId = req.authUser._id
    const {productId}= req.params
    const {quantity}= req.body

    const cart = await Cart.findOne({userId,'products.productId':productId})
    if(!cart){
        return next(new ErrorClass('product not found in the cart',404))
    }

    const product = await checkProductAvaliability(productId,quantity)
    if(!product){
        return next(new ErrorClass('product not available',404))
    }

    const productIndex = cart.products.findIndex(p=> p.productId.toString() == product._id.toString())
    cart.products[productIndex].quantity = quantity

    // cart.subTotal = 0
    // cart.products.forEach(p => {
    //     cart.subTotal += p.price * p.quantity
    // });

    await cart.save()
    res.status(200).json({message:'product updated',cart})

}

/**
 * @api {PuT} /carts/remove  delete from-cart
 */
export const removeFromCart = async (req,res,next)=>{
    const userId = req.authUser._id
    const {productId}= req.params

    const cart = await Cart.findOne({userId,'products.productId':productId})
    if(!cart){
        return next(new ErrorClass('product not found in the cart',404))
    }

    cart.products = cart.products.filter(p=>p.productId != productId)

    // if(cart.products.length === 0){
    //     await Cart.deleteOne({userId})
    //     return res.status(200).json({message:'product removed from cart'})
    // }

    

    await cart.save()
    res.status(200).json({message:'product removed'})
}

/**
 * @api {GET} /carts/  get-cart
 */
export const getCart = async(req,res,next)=>{
    const userId = req.authUser._id

    const cart = await Cart.findOne({userId})
    res.status(200).json({message:"cart fetched successfully", cart})
}