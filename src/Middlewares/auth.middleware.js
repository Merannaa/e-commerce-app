import jwt from "jsonwebtoken"
import { ErrorClass } from "../Utils/index.js"
import {User} from '../../DB/Models/index.js'

export const auth = ()=>{
    return async(req,res,next)=>{
        try {
            const{token} = req.headers
            if(!token)
                 return res.status(401)
                .json({
                message:"Please signin First, there is no token generated"})
            if(!token.startsWith("ECOMM")){
                return res.status(400)
                .json({message:"Invalid Token"})}
            //split token from prefix
            const originalToken = token.split(" ")[1];
            //decoded token
            const decodedData = jwt.verify(originalToken,
                "accessTokenSignature"
            )
            if(!decodedData?._id){
                return res.status(400).json({
                    message:"Invalid Token Payload"})}
            //find userId
            const user = await User.findById(
                decodedData._id).select("-password")
            if(!user){
                return res.status(404).json({
                    message:"Please signup and try to login"
                })
            }
            
            req.authUser = user
            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({message:"something went wrong"})
        }
    }
}

export const isAuthorized=(roles=[])=>{
    return async(req,res,next)=>{
        try {
            const{role}=req.authUser
            if(!roles.includes(role)) 
                {return next(new ErrorClass("not authorized !",403))}
            next()
        } catch (error) {
            console.log(error);
            res.status(500).json({message:"something went wrong in authorized"})
        }
        
    }

}