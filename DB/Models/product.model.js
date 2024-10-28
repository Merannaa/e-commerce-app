import mongoose from "../global-setup.js";

import slugify from 'slugify'

import { DiscountType ,Badges,calculateProductPrice} from "../../src/Utils/index.js";


const {Schema, model} = mongoose;


const productSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    slug:{
        type:String,
        required:true,
        lowercase:true,
        default:function(){
            return slugify(this.title,{replacement:'_',lower:true})
        }
    },
    overview: String,
    specs:Object,
    badges:{
        type:String,
        enum:Object.values(Badges)
    },
    price:{
        type:Number,
        required:true,
        min:50
    },
    appliedDiscount:{
        amount:{
            type:Number,
            min:0,
            default:0
        },
        type:{
            type:String,
            enum:Object.values(DiscountType),
            default:DiscountType.PERCENTAGE
        }
    },
    appliedPrice:{
        type:Number,
        required:true,
        default:function(){
            return calculateProductPrice(this.price,this.appliedDiscount)
        }
    },
    stock:{
        type:Number,
        required:true,
        min:10
    },
    rating:{
        type:Number,
        min:0,
        max:5,
        default:0
    },
    Images:{
        URLs: [
            {
            secure_url:{
                type: String,
                required: true
                },
            public_id:{
                type: String,
                required: true,
                unique:true
                }
            }
        ],
        customId: {
          type: String,
          required: true,
          unique: true,
        },
      },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User", 
        required:false, //Todo change it after user
    },
   
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    subCategoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubCategory",
        required:true
    },
    brandId:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:"Brand",
        required:true,
    },
},
{
    timestamps: true, 
    toJSON: {virtuals: true }, 
    toObject: {virtuals: true },
    id: false
});

productSchema.virtual("Reviews", {
    ref: "Review",
    localField: "_id",
    foreignField: "productId"
  });

export const Product = mongoose.models.Product || model('Product', productSchema)