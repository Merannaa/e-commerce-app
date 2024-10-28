import { DateTime } from "luxon"
import { Address, Cart, Order, Product } from "../../../DB/Models/index.js"
import { ErrorClass, OrderStatus, PaymentMethods, ApiFeatures } from "../../Utils/index.js"
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
    if(!cart || !cart.products.length){
        return next(new ErrorClass('cart is empty',400))
    }

    //check the stock of product is sold out
    const isSoldOut = cart.products.find((p)=> p.productId.stock < p.quantity)
     if(isSoldOut){
        return next(new ErrorClass(`product ${isSoldOut.productId.title} is sold out" ,400`))
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
   //   cart.products = [];
   //   await cart.save()

     //decrement the stock of products hook 


     res.status(201).json({message:'order created',order:orderObj})
}

export const cancelOrder = async (req,res,next)=>{
   const {_id} = req.authUser
   const {orderId} = req.params

   //find order by auth user
   const order = await Order.findOne({
      _id:orderId, 
      userId:_id,
      orderStatus:{
         $in:[OrderStatus.Pending,OrderStatus.Placed,OrderStatus.Confirmed]
      }})
   //check if order exist 
   if(!order){
      return next(new ErrorClass('order not found',404))
   }

   //check 3 days passed on the order or not
   const orderDate = DateTime.fromJSDate(order.createdAt)
   const currentDate = DateTime.now()
   const diff = Math.ceil(
      Number(currentDate.diff(orderDate,'days').toObject().days).toFixed(2)
   )
   if(diff > 3){
      return next(new ErrorClass('cannot cancel order after 3 days',400))
   }

   //update orderstatus to cancel
   order.orderStatus= OrderStatus.Cancelled;
   order.cancelledAt=DateTime.now();
   order.cancelledeBy=_id;

   await Order.updateOne({_id:orderId},order)

   //update product model in stock
   for(const product of order.products){
      await Product.updateOne({_id:product.productId},{$inc:{stock:product.quantity}})
   }
   res.status(200).json({message:'order cancelled',order})
}

export const deliveredOrder = async (req,res,next)=>{

   const {_id} = req.authUser;
   const {orderId} = req.params;

   //find order by auth user
   const order = await Order.findOne({
      _id:orderId, 
      userId:_id,
      orderStatus:{
         $in:[OrderStatus.Placed,OrderStatus.Confirmed]
      }})
   //check if order exist 
   if(!order){
      return next(new ErrorClass('order not found',404))
   }

   //update the order status to be delivered
   order.orderStatus = OrderStatus.Delivered;
   order.deliveredAt = DateTime.now();

   await Order.updateOne({_id:orderId}, order)

   res.status(200).json({message:'order delivered', order})

}

export const listOrders = async(req,res,next)=>{
   const {_id} = req.authUser;

   const query = {userId:_id, ...req.query}

   

   const populateArray = [
      {path:"products.productId", select:"title Images rating appliedPrice "}
   ];

   const apiFeatureInstance = new ApiFeatures(Order, query, populateArray).pagination().sort().filters()

   const orders = await apiFeatureInstance.mongooseQuery;
   
   res.status(200).json({message:'orders list', orders})

}