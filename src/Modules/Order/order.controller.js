import { DateTime } from "luxon"
import { Address, Cart, Order } from "../../../DB/Models/index.js"
import { ErrorClass, OrderStatus, PaymentMethods } from "../../Utils/index.js"
import { calculateSubTotal } from "../Cart/Utils/cart.utils.js"
import { applyCoupon, validateCoupon } from "./Utils/order.utils.js"


/**
 * @api {POST} /orders/create  add order
 */
export const createOrder = async (req,res,next)=>{
    const userId = req.authUser._id
    const {address, addressId, contactNumber, couponCode, shippingFee, VAT, paymentMethod} = req.body

    //find logged in user's cart with product
    const cart = await Cart.findOne({userId}).populate('products.productId')
    if(!cart || cart.products.length){
        return next(new ErrorClass('cart is empty',400))
    }

    //check the stock of product is sold out
    const isSoldOut = cart.products.find((p)=> p.productId.stock < p.quantity)
     if(isSoldOut){
        return next(new ErrorClass(`product ${isSoldOut.productId.title} is sold out`,400))
     }

     //calculate new subtotal
     const subTotal = calculateSubTotal(cart.products)
     let total = subTotal + shippingFee + VAT

     let coupon = null
     if(couponCode){
        const isCouponValid = await validateCoupon(couponCode, userId)
        if(isCouponValid.error){
            return next(new ErrorClass(isCouponValid.message,400))
        }
        coupon = isCouponValid.coupon
        total = applyCoupon(subTotal,coupon)
     }

     if(!address && !addressId){
        return next(new ErrorClass('address is required',400))
     }
     //check if address is valid 
     if(addressId){
        const addressInfo = await Address.findOne({_id:addressId,userId})
        if(!addressInfo){
            return next(new ErrorClass('invalid address',400))
        }
     }

     //check order status with payment method
     let orderStatus  = OrderStatus.Pending
     if(paymentMethod === PaymentMethods.Cash){
        orderStatus = OrderStatus.Placed
     }

     //create orderObject
     const orderObj = new Order({
        userId,
        products:cart.products,
        address,
        addressId,
        contactNumber,
        shippingFee,
        VAT,
        subTotal,
        couponId: coupon?._id,
        paymentMethod,
        orderStatus,
        estimatedDeliveryDate: DateTime.now().plus({days:7}).toFormat("yyyy-MM-dd")
     })

     await orderObj.save()

     //clear cart
     cart.products = [];
     await cart.save()

     //decrement the stock of products hook 


     res.status(201).json({message:'order created',order:orderObj})
}