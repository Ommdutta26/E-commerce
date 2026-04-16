const Products=require('../models/products.model')

module.exports.addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        const existingItem = user.cartItem.find(item =>
            item.product && item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItem.push({ product: productId, quantity: 1 });
        }

        await user.save();
        res.status(201).json(user.cartItem);
    } catch (error) {
        console.log("Error unable to add products to cart", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports.removeAll=async(req,res)=>{
    try {
        const {productId}=req.body
        const user=req.user
        if(!productId){
            user.cartItem=[]
        }else{
            user.cartItem=user.cartItem.filter((item)=>item.id!==productId)
        }
        await user.save()
        res.status(200).json(user.cartItem)
    } catch (error) {
        console.log("failed to remove items from cart",error)
    }
}


module.exports.getCartProducts = async (req, res) => {
    try {
        const productIds = req.user.cartItem.map(item => item.product);
        const products = await Products.find({ _id: { $in: productIds } });

        const cartItem = products.map((product) => {
            const item = req.user.cartItem.find(
                (cartItem) =>  cartItem.product && cartItem.product.toString() === product._id.toString()
            );
            return { ...product.toJSON(), quantity: item.quantity };
        });

        res.status(200).json(cartItem);
    } catch (error) {
        console.log("Error in getting cart products", error);
        res.status(500).json({ error: "Failed to get cart products" });
    }
};


module.exports.updateCartProduct = async (req, res) => {
    try {
        const { id: productId } = req.params; // Product ID from URL params
        const { quantity } = req.body; // Quantity from request body
        const user = req.user; // Authenticated user

        // Log the user cart to debug
        console.log('User Cart Items:', user.cartItem);

        // Find the existing item in the user's cart by matching the _id field
        const existingItem = user.cartItem.find((item) => item.product.toString() === productId);

        if (existingItem) {
            if (quantity === 0) {
                // If quantity is 0, remove the product from the cart
                user.cartItem = user.cartItem.filter((item) => item.product.toString() !== productId); // Match by _id
                await user.save();
                return res.json(user.cartItem);
            }

            // Otherwise, update the quantity of the product
            existingItem.quantity = quantity;
            await user.save();
            res.json(user.cartItem);
        } else {
            return res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
