import { ErrorClass } from "../Utils/index.js"



const reqKeys=['body','params','query','headers','authUser']

export const validationMiddleware=(Schema)=>{
    return(req,res,next)=>{
        let validationError =[]
        for(const key of reqKeys){
            const validationResult=Schema[key]?.validate(req[key],{abortEarly:false})
            if(validationResult?.error){
               validationError.push(validationResult.error.details)
            }
        }
        validationError.length 
        ? next(new ErrorClass("Validation Error",400,validationError))
        :
        next();
    }
}