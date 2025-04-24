const express = require('express');
const router = express.Router();
const { createFoodItem, getFoodItems, updateFoodItem, deleteFoodItem, getAllFoodItems, getFoodItemsHome,
    getFoodItemsForAdmin
} = require('../controllers/foodItemController');
const multer = require('multer');
const path = require('path');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleWare');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createFoodItem);
router.get('/', getFoodItems);
router.get('/get_home_product', getFoodItemsHome);
router.get('/get_food_admin', getFoodItemsForAdmin);
router.get('/all', getAllFoodItems);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateFoodItem);
router.delete('/:id', authMiddleware, adminMiddleware, deleteFoodItem);

module.exports = router;