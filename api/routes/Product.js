const express = require('express');
const router = express.Router();
const productController = require('../controllers/Product');

router.get('/', productController.getProduct);
router.get('/:id', productController.getSpecificProduct);

module.exports = router;