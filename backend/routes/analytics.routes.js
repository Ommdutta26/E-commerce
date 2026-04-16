const express=require('express')
const router=express.Router()
const auth=require('../middleware/auth')
const {getAnalytics}=require('../controllers/analytics.controller')

router.get('/',auth.authMiddleware,auth.admin,getAnalytics)


module.exports=router