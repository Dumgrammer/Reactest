const express = require('express');
const router = express.Router();
const protect = require('../middleware/Auth');

const orderController = require('../controllers/Order');

router.post('/', protect, orderController.orderProduct);


module.exports = router;