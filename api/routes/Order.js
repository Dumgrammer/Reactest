const express = require('express');
const router = express.Router();
const protect = require('../middleware/Auth');

const orderController = require('../controllers/Order');

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getSpecificOrders);

router.post('/', orderController.orderProduct);

router.put('/:id/payment', orderController.orderPayment);
router.put('/:id/status', orderController.updateOrderStatus);

router.get('/all', orderController.getAllOrders);
router.get('/myorders/:id', orderController.getUserOrders);
router.get('/myorders/:userId/:orderId', orderController.getUserOrderById);

module.exports = router;