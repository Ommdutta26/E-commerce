const mongoose=require('mongoose')
const BlackListToken=new mongoose.Schema({
    token:{
        type:String,
        unique:true
    },createdAt:{
        type:Date,
        default:Date.now,
        expires:86400
    }
})
module.exports=mongoose.model('BlackListToken',BlackListToken)