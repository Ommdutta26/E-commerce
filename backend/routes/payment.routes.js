const express=require('express')
const router=express.Router()
const auth=require('../middleware/auth')
const {checkoutSession,paymentSuccess}=require('../controllers/payment.controller')
router.post('/create-checkout-session',auth.authMiddleware,checkoutSession)
router.post('/checkout-success',auth.authMiddleware,paymentSuccess)


module.exports=router