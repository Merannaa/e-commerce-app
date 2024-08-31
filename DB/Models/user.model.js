import { hashSync } from 'bcrypt';
import mongoose from '../global-setup.js';

const {Schema, model} = mongoose;


const userSchema = new Schema(
    {
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    userType:{
        type:String,
        required:true,
        enum:["Buyer","Admin"]
    },
    age:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        enum:["Female","Male"]
    },
    phone:{
        type:String,
        required:false,
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    isMarkedAsDeleted:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:['online','offline'],
        default:'offline'
    }
    }
    ,{
    timestamps:true
})

//document hooks(middleware)
userSchema.pre('save', function(next){
    if(this.isModified("password")){
        this.password=hashSync(this.password,+process.env.SALT_ROUNDS);
    }
    next();
})

//updateone hook
// userSchema.pre('updateOne',{document:true,query:false},function(next){
//     console.log(this);
    
//     next()
// })
// userSchema.post('updateOne',{document:true,query:false},function(doc,next){
//     console.log(this);
    
//     next()
// })

//query middleware
userSchema.pre(["updateOne","findOneAndUpdate"],function(next){
    console.log(this.getQuery());
    console.log(this.getFilter());
    console.log(this.getOptions());
    console.log(this.getUpdate());
    console.log(this.projection());

    next()
})

userSchema.post('save',function(doc,next){
    next();
})

export const User = mongoose.models.User || model('User', userSchema);