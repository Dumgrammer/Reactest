const express = require('express');
const router = express.Router();
const protect = require('../middleware/Auth');

const orderController = require('../controllers/Order');

router.get('/', protect, orderController.getAllOrders);
router.get('/:id', protect, orderController.getSpecificOrders);

router.post('/', protect, orderController.orderProduct);

router.put('/:id/payment', protect, orderController.orderPayment);

module.exports = router;