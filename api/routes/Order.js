const express = require('express');
const router = express.Router();
const protect = require('../middleware/Auth');

const orderController = require('../controllers/Order');

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getSpecificOrders);

router.post('/', orderController.orderProduct);

router.put('/:id/payment', orderController.orderPayment);

module.exports = router;