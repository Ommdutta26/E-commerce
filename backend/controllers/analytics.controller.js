const User = require('../models/user.model');
const Products = require('../models/products.model');
const Order = require('../models/order.model');

async function getAnalyticsData() {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Products.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
            }
        }
    ]);

    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
        users: totalUsers,
        products: totalProducts,
        totalSales,
        totalRevenue
    };
}

async function getDailySalesData(startDate, endDate) {
    const dailySalesData = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                sales: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    const dateArray = getDatesRange(startDate, endDate);
    return dateArray.map(date => {
        const foundData = dailySalesData.find(item => item._id === date);
        return {
            date,
            sales: foundData?.sales || 0,
            revenue: foundData?.revenue || 0
        };
    });
}

function getDatesRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

module.exports.getAnalytics = async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.json({
            analyticsData,
            dailySalesData
        });
    } catch (error) {
        console.log("Internal Server Error", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
