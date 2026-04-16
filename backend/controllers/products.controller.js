const Products=require('../models/products.model')
const redis=require('../redis')
const {validationResult}=require('express-validator')
const cloudinary=require('../cloudinary')


module.exports.getAllProducts=async(req,res)=>{
    try {
        const products=await Products.find({})
        res.status(200).json({products})
    } catch (error) {
        console.log("Internal server error",error)
    }
}

module.exports.getFeaturedProducts=async(req,res)=>{
    try {
        let featuredProducts=await redis.get('featured_products')
        if(featuredProducts){
            return res.json(JSON.parse(featuredProducts))
        }
        featuredProducts=await Products.find({isFeatured:true}).lean()
        if(!featuredProducts){
            return res.status(400).json({message:"No featured products found in the database"})
        }
        await redis.set(`featured_products`,JSON.stringify(featuredProducts))
        res.json(featuredProducts)
    } catch (error) {
        console.log("Internal server error",error)
    }
}

module.exports.createProducts = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Please provide valid credentials" });
        }

        const {name,image,description,price,category}=req.body;

        if (!name || !image || !description || !price || !category) {
            return res.status(400).json({ message: "Please provide all credentials" });
        }

        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }

        const product = await Products.create({
            name,
            image: cloudinaryResponse?.secure_url || "", 
            description,
            price,
            category
        });

        return res.status(201).json({message:"Product created successfully",product});
    } catch (error) {
        console.error("Internal server error: Could not create product", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports.deleteProduct=async(req,res)=>{
    try {
        const {id}=req.params
        const product=await Products.findById(id)
        if(!product){
            return res.status(400).json({message:"Product not found"})
        }
        if(product.image){
            const publicId=product.image.split("/").pop().split(".")[0]
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
            } catch (error) {
                console.log("Error occurred could not delete image",error)
            }
        }
        await Products.findByIdAndDelete(id)
        res.status(200).json({message:"Product deleted successfully"})
    } catch (error) {
        console.log("Internal server error could not delete product",error)
    }
}


module.exports.getRecommendedProducts=async(req,res)=>{
    try {
        const products=await Products.aggregate([
            {
                $sample:{size:3}
            },{
                $project:{
                    _id:1,
                    name:1,
                    description:1,
                    image:1,
                    price:1
                }
            }
        ])
        res.status(200).json(products)
    } catch (error) {
        console.log("Internal Server Error could not get recommended products",error)
    }
}


module.exports.getCategoryProducts=async(req,res)=>{
    try {
        const {category}=req.params
        const products=await Products.find({category})
        res.status(201).json(products)
    } catch (error) {
        console.log("Unable to fetch category products",error)
    }
}

async function updateProductCache() {
    try {
        const featuredProducts=await Products.find({isFeatured:true}).lean()
        await redis.set("featured_products",JSON.stringify(featuredProducts))

    } catch (error) {
        console.log("Internal Server error",error)   
    }
}

module.exports.toggleFeaturedComponents=async(req,res)=>{
    try {
        const product=await Products.findById(req.params.id)
        if(product){
            product.isFeatured=!product.isFeatured
            const updateProduct=await product.save()
            await updateProductCache();
            res.json(updateProduct)
        }else{
            res.status(400).json({message:"Internal server error"})
        }
    } catch (error) {
        console.log("Some error occurred",error)
    }
}