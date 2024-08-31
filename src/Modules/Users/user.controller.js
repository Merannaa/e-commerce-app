
import { hashSync,compareSync } from 'bcrypt'
import {Address, User} from '../../../DB/Models/index.js'
import { ErrorClass } from '../../Utils/index.js'
import jwt from 'jsonwebtoken'

/**
 * @api {POST} /users/register  signup user
 */

export const signup = async (req,res,next)=>{
    //destruct data
    const {username, email, password, age, gender, phone, userType,
        country,city,postalCode,buildingNumber,floorNumber,addressLabel
    }=req.body

    //email check

    const isEmailExists= await User.findOne({email})
    if(isEmailExists){
        return next(new ErrorClass("Email is already exist",400))
    }


    //send email verify

    //userObject
    const userObject= new User({
        username,
        email,
        password,
        gender,
        age,
        phone,
        userType
    })

    //generate token for _id to secure
    const token =jwt.sign(
        {_id:userObject._id},
        "confirmationToken",
        {expiresIn:"24h"}
    )

    //create new address instance
    const addressInstance = new Address({
        userId:userObject._id,country,city,postalCode,buildingNumber,floorNumber,addressLabel,isDefault:true
    })

    //create  user in db
    // const newUser= await User.create(userObject)

    const newUser= await userObject.save();

    //create in addressmodel db
    const newAddress = await addressInstance.save()
    //send response
    res.status(201).json({
        status:'success',
        message:'user created successfully',
        data:newUser,
        newAddress
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

/**
 * @api {POST} /users/login  login user
 */
export const  signin = async(req,res,next)=>{
    //data
    const{email,mobileNumber,password}=req.body

    //check user email
    const user = await User.findOne({$or:[{email},{mobileNumber}]})
    if(!user){
        next( new ErrorClass("Invalid login credentails",
            404,
            "invalid login Stack",
            "Error from signin controller"
        ))
    }

    //match password
    const isMatch = compareSync(password, user.password)
    if(!isMatch){
        next( new ErrorClass("Invalid login credentails",
            404,
            "invalid login Stack",
            "Error from signin match password"
        ))
    }

    //generate token
    const token = jwt.sign(
        {
        _id:user._id,
        email:user.email,
        role: user.role
        },
    "accessTokenSignature",
    {expiresIn:"24h"}
)
//update status
    user.status='online';
    await user.save();

    res.status(200).json({message:"User Logged in Successfully", token})
}