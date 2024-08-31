
import { Address,User } from '../../../DB/Models/index.js'
import { ErrorClass } from '../../Utils/index.js'

/**
 * @api {POST} /addresses/add   add address
 */
export const addAdress= async(req,res,next)=>{
    //destruct data
    const {country,city,postalCode,buildingNumber,floorNumber,addressLabel,setAsDefault}=req.body
    //login user
    const userId= req.authUser._id

    const newAddress = new Address({
        userId,country,city,postalCode,buildingNumber,floorNumber,addressLabel,
        isDefault:[true,false].includes(setAsDefault) ? setAsDefault : false
    })

    //check address default to make it false 
    if(newAddress.isDefault){
        await Address.updateOne({userId,isDefault:true},{isDefault:false})
    }
    const address = await newAddress.save()
    res.status(200).json({message:'address created', address})
}

/**
 * @api {PUT} /addresses/edit/:id  edit address by id
 */
export const updateAddress = async (req,res,next)=>{

    const {country,city,postalCode,buildingNumber,floorNumber,addressLabel,setAsDefault}=req.body

    const userId= req.authUser._id

    const {addressId}=req.params

    const address = await Address.findOne({ _id: addressId, userId, isMarkedAsDeleted: false })
    if(!address){
        return next(new ErrorClass("address not found",404))
    }

    const addressObject = {
        userId,country,city,postalCode,buildingNumber,floorNumber,addressLabel,
        isDefault:[true,false].includes(setAsDefault) ? setAsDefault : false
    }
    if(addressObject.isDefault){
        await Address.updateOne({userId,isDefault:true},{isDefault:false})
    }

    if(country) address.country = country;
    if(city) address.city = city;
    if(postalCode) address.postalCode = postalCode;
    if(buildingNumber) address.buildingNumber = buildingNumber;
    if(floorNumber) address.floorNumber= floorNumber;
    if(addressLabel) address.addressLabel= addressLabel;
    if([true,false].includes(setAsDefault)) {
        address.isDefault= [true,false].includes(setAsDefault) ? setAsDefault : false
        await Address.updateOne({userId,isDefault:true},{isDefault:false})
    }


    await address.save()
    res.status(200).json({message:"address updated",address})
}

/**
 * @api {DELETE} /addresses/delete/:id  delete address by id
 */
export const deletAddress = async (req,res,next)=>{
    const userId= req.authUser._id

    const {addressId}=req.params

    const address = await Address.findOneAndUpdate({ _id: addressId, userId, isMarkedAsDeleted: false },
        {isMarkedAsDeleted:true,isDefault:false},
        {new:true})
    if(!address){
        return next(new ErrorClass("address not found",404))
    }

    res.status(200).json({message:"address deleted"})
}

/**
 * @api {GET} /addresses/  get all addresses
 */
export const getAddresses = async (req,res,next)=>{
    const userId= req.authUser._id
    const addresses = await Address.find({userId,isMarkedAsDeleted:false})
    res.status(200).json({message:"all addresses",addresses})

}