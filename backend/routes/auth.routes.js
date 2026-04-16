const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const {authMiddleware} = require('../middleware/auth');
const { body } = require('express-validator');

router.post('/signup', [
    body('name').isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
    body('email').isEmail().withMessage("Please provide a valid email"),
    body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
], authController.SignUp);

router.post('/login', [
    body('email').isEmail().withMessage("Please provide a valid email"),
    body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
], authController.login);

router.post('/logout', authMiddleware, authController.logout);

router.post('/refresh-token',authController.refreshToken)

router.get('/profile',authMiddleware,authController.getProfile)
module.exports = router;
