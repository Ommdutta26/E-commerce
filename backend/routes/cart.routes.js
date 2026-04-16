const express=require('express')
const router=express.Router()
const auth=require('../middleware/auth')
const { removeAll, addToCart, updateCartProduct, getCartProducts } = require('../controllers/cart.controller')



router.get('/',auth.authMiddleware,getCartProducts)
router.post('/',auth.authMiddleware,addToCart)
router.delete('/',auth.authMiddleware,removeAll)
router.put('/:id',auth.authMiddleware,updateCartProduct)



module.exports=router