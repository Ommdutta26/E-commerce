const BlackListModel=require('../models/BlackList.Model')
const User=require('../models/user.model')
const jwt=require('jsonwebtoken')

module.exports.authMiddleware=async(req,res,next)=>{
    const token=req.cookies.token || req.headers.authorization?.split(' ')[1]
    console.log("Received Token:", req.cookies.token || req.headers.authorization);

    if(!token){
        return res.status(400).json({message:"UnAuthorised"})
    }

    const  BlackListed=await BlackListModel.findOne({token})
    if(BlackListed){
        return res.status(400).json({message:"UnaAthorised"})
    }
    
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await User.findById(decoded._id)
        req.user=user
        return next() 
    } catch (error) {
        console.log("failed to authenticate the user")
    }
}

module.exports.admin=async(req,res,next)=>{
    if(req.user && req.user.role==="admin"){
        next();
    }else{
        return res.status(400).json({message:"Admin access denied"})
    }
}