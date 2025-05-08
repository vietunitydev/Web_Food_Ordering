const express = require('express');
const router = express.Router();
const { createFoodItem, getFoodItems, updateFoodItem, deleteFoodItem, getAllFoodItems, getFoodItemsHome,
    getFoodItemsForAdmin
} = require('../controllers/foodItemController');
const multer = require('multer');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleWare');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình storage cho Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'food-app', // tên thư mục lưu trên Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const upload = multer({ storage });

router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createFoodItem);
router.get('/', getFoodItems);
router.get('/get_home_product', getFoodItemsHome);

router.get('/get_food_admin', authMiddleware, adminMiddleware, getFoodItemsForAdmin);
router.get('/all',authMiddleware, adminMiddleware, getAllFoodItems);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateFoodItem);
router.delete('/:id', authMiddleware, adminMiddleware, deleteFoodItem);

module.exports = router;