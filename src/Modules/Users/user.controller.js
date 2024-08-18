
import { hashSync } from 'bcrypt'
import {User} from '../../../DB/Models/index.js'
import { ErrorClass } from '../../Utils/index.js'

/**
 * @api {POST} /users/register  signup user
 */

export const signup = async (req,res,next)=>{
    //destruct data
    const {username, email, password, age, gender, phone, userType}=req.body

    //email check

    const isEmailExists= await User.findOne({email})
    if(isEmailExists){
        return next(ErrorClass("Email is already exist",400))
    }

    //send email verify

    //userObject
    const userObject={
        username,
        email,
        password,
        gender,
        age,
        phone,
        userType
    }

    //create  user in db
    const newUser= await User.create(userObject)

    // const newUser= await userObject.save();

    //send response
    res.status(201).json({
        status:'success',
        message:'user created successfully',
        data:newUser
    })
} 

/**
 * @api {PUT} /users/update  update user
 */

export const updateUser = async(req,res,next)=>{
    //id in param
    const {userId} =req.params
    const {password, username}=req.body

    //find user
    // const user =await User.findById(userId)
    // if(!user){
    //     return next(new ErrorClass("User not found"))
    // }

    // if(password){
    //    user.password=password
    // }

    // if(username){
    //     user.username= username
    // }
    //await user.save()
    
    
    //use to pre hooks
    //send condition with instance
    // const document = new User({_id:userId})
    // const user = await document.updateOne({username})

    const user = await User.findOneAndUpdate({_id:userId},{username},{new:true}).
    select("-password")

   

    //response
    res.status(200).json({
        status:'success',
        message:"user update successfully",
        data:user
    })

}