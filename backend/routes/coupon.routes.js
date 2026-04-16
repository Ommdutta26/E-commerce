const express=require('express')
const CouponModel=require('../models/coupon.model')
const auth=require('../middleware/auth')
const { getCoupons, validateCoupon } = require('../controllers/coupon.controller')
const router=express.Router()

router.get('/',auth.authMiddleware,getCoupons)
router.post('/validate',auth.authMiddleware,validateCoupon)

module.exports=router