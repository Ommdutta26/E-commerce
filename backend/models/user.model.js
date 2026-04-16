const mongoose=require("mongoose")
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')
const UserModel=new mongoose.Schema({
    name:{
        type:String,
        minLength:3,
        required:true,
    },email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },password:{
        type:String,
        minLength:6,
        required:true,
    },
    cartItem:[
        {
            quantity:{
                type:Number,
                default:1
            },product:{
                type:mongoose.SchemaTypes.ObjectId,
                ref:"Products"
            }
        }
    ],
    role:{
        type:String,
        enum:['customer','admin'],
        default:'customer'
    }
},{timestamps:true})

UserModel.methods.generateAuthToken= async function(){
    const token=jwt.sign({_id:this._id},process.env.JWT_SECRET,{expiresIn:"24h"})
    return token
}

UserModel.methods.generateRefreshToken= async function(){
    const token=jwt.sign({_id:this._id},process.env.JWT_REFRESH_SECRET,{expiresIn:"7d"})
    return token
}


UserModel.statics.hashPassword=async function(password){
    return await bcrypt.hash(password,10);
}

UserModel.methods.comparePassword=async function (password){
    return await bcrypt.compare(password,this.password)
}


module.exports=mongoose.model("User",UserModel)