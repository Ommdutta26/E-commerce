const express=require('express')
const router=express.Router()
const {body}=require('express-validator')
const Products=require('../controllers/products.controller')
const auth=require('../middleware/auth')

router.get('/',auth.authMiddleware,auth.admin,Products.getAllProducts)
router.get('/featured',Products.getFeaturedProducts)
router.post('/create-products',[
    body("name").isLength({min:3}).withMessage("Product name must be at least 3 characters long"),
    body('description').isLength({min:6}).withMessage("Product description must be at least 6 character long"),
    body("price").isFloat({min:0}).withMessage("Price must be greater than 0")

],auth.authMiddleware,auth.admin,Products.createProducts)
router.delete("/:id",auth.authMiddleware,auth.admin,Products.deleteProduct)
router.get('/recommendations',Products.getRecommendedProducts)
router.get('/category/:category',Products.getCategoryProducts)
router.patch('/:id',auth.authMiddleware,auth.admin,Products.toggleFeaturedComponents)
module.exports=router