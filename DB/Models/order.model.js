import { OrderStatus, PaymentMethods } from "../../src/Utils/index.js"
import mongoose from "../global-setup.js";
import { Coupon } from "./coupon.model.js";
import { Product } from "./product.model.js";



const {Schema, model} = mongoose;


const orderSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    products:[
        {
            productId:{
                type:Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                min:1,
                required:true
            }
        }
    ],
    fromCart:{
        type:Boolean,
        default:true
    },
    address:String,
    addressId:{
        type:Schema.Types.ObjectId,
        ref:'Address',
        // required:true
    },
    contactNumber:{
        type:String,
        required:true
    },
    subTotal:{
        type:Number,
        required:true
    },
    shippingFee:{
        type:Number,
        required:true
    },
    VAT:{
        type:Number,
        required:true
    },
    couponId:{
        type:Schema.Types.ObjectId,
        ref:'Coupon',
    },
    total:{
        type:Number,
        // required:true
    },
    estimatedDeliveryDate:{
        type:Date,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true,
        enum:Object.values(PaymentMethods)
    },
    orderStatus:{
        type:String,
        required:true,
        enum:Object.values(OrderStatus)
    },
    deliveredBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    cancelledeBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    deliveredAt:Date,
    cancelledAt:Date
},
{
    timestamps:true
})


orderSchema.post('save', async function(){
    for (const product of this.products) {
        await Product.updateOne({_id:product.productId},{$inc:{stock: -product.quantity}})
    }

    //increment usageCount in coupon
    if(this.couponId){
      const coupon =  await Coupon.findById({_id:this.couponId})
      coupon.Users.find(u => u.userId.toString() === this.userId.toString()).usageCount++;
      await coupon.save()
    }
})
export const Order = mongoose.models.Order || model('Order', orderSchema)