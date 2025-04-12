const express = require('express');
const router = express.Router();
const {
    createCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
    applyCoupon,
} = require('../controllers/couponController');
const { authMiddleware, adminMiddleware, userMiddleware } = require('../middleware/authMiddleWare');

router.post('/', authMiddleware, adminMiddleware, createCoupon);
router.put('/:id', authMiddleware, adminMiddleware, updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCoupon);

router.get('/', getCoupons);
router.post('/apply', authMiddleware, userMiddleware, applyCoupon);

module.exports = router;