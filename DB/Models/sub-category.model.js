import mongoose from "../global-setup.js";

const {Schema, model} = mongoose;


const subCategorySchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User", 
        required:false, //Todo change it after user
    },
    Images:{
        secure_url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
          unique: true,
        },
      },
    customId:{ //about name of the category on host
        type:String,
        required:true,
        unique:true
    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    }
},
{
    timestamps:true
})

export const SubCategory = mongoose.models.SubCategory || model('SubCategory', subCategorySchema)