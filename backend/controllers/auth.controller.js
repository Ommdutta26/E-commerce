const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const BlackListModel = require('../models/BlackList.Model');
const redis = require('../redis');
const jwt = require('jsonwebtoken');

module.exports.SignUp = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Please provide valid credentials" });
        }

        const { email, password, name } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await User.hashPassword(password);
        const newUser = await User.create({ name, email, password: hashedPassword });

        const token = await newUser.generateAuthToken();

        const { password: _, ...userSafe } = newUser.toObject(); // exclude password

        res.status(200).json({
            message: "User created successfully",
            user: userSafe,
            token
        });

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Please provide valid credentials" });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User with this email does not exist" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Please enter a valid password" });
        }

        const token = await user.generateAuthToken();
        const refreshToken = await user.generateRefreshToken();

        await redis.set(`refresh_token:${user._id}`, refreshToken, "EX", 7 * 24 * 60 * 60);
        await redis.set(`token:${user._id}`, token, "EX", 24 * 60 * 60);

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const { password: _, ...userSafe } = user.toObject();

        res.status(200).json({
            message: "User logged in successfully",
            user: userSafe,
            token
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.logout = async (req, res) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (refresh_token) {
            try {
                const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
                await redis.del(`refresh_token:${decoded._id}`);
                await redis.del(`token:${decoded._id}`);
            } catch (error) {
                console.log("Invalid refresh token:", error.message);
            }
        }

        res.clearCookie('token');
        res.clearCookie('refresh_token');

        if (token) {
            await BlackListModel.create({ token });
        }
        if (refresh_token) {
            await BlackListModel.create({ token: refresh_token });
        }

        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.refreshToken = async (req, res) => {
    try {
        const refresh_token = req.cookies.refresh_token;

        if (!refresh_token) {
            return res.status(400).json({ message: "Refresh token not found" });
        }

        let decoded;
        try {
            decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }

        const storedToken = await redis.get(`refresh_token:${decoded._id}`);
        if (!storedToken || storedToken !== refresh_token) {
            return res.status(400).json({ message: "Invalid refresh token" });
        }

        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newToken = await user.generateAuthToken();

        await redis.set(`token:${user._id}`, newToken, "EX", 24 * 60 * 60);

        // Optional: Refresh token rotation
        // const newRefreshToken = await user.generateRefreshToken();
        // await redis.set(`refresh_token:${user._id}`, newRefreshToken, "EX", 7 * 24 * 60 * 60);
        // res.cookie('refresh_token', newRefreshToken, {
        //     httpOnly: true,
        //     sameSite: "strict",
        //     secure: process.env.NODE_ENV === "production",
        //     maxAge: 7 * 24 * 60 * 60 * 1000
        // });

        res.cookie('token', newToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Token refreshed successfully",
            token: newToken
        });

    } catch (error) {
        console.error("Error refreshing token:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.getProfile = async (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
