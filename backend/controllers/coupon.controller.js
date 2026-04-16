const CouponModel = require('../models/coupon.model');

module.exports.getCoupons = async (req, res) => {
    try {
        const coupon = await CouponModel.findOne({ userId: req.user._id, isActive: true });
        res.json(coupon || null);
    } catch (error) {
        console.log("Error in getting coupon", error);
        res.status(500).json({ message: "Error in getting coupons" });
    }
};

module.exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        
        // Awaiting the query
        const coupon = await CouponModel.findOne({ code: code, userId: req.user._id, isActive: true });
        
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        // Ensure expirationDate is a valid Date object
        const currentDate = new Date();
        const expirationDate = new Date(coupon.expirationDate);

        if (expirationDate < currentDate) {
            coupon.isActive = false;  // Deactivate the expired coupon
            await coupon.save();
            return res.status(404).json({ message: "Coupon expired" });
        }

        // Respond with valid coupon details
        res.status(200).json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        });
    } catch (error) {
        console.log("Internal server error could not validate coupon", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
