const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/Product');
const protect = require('../middleware/Auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname );
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpg',
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid File Type!"), false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

// Regular product routes
router.get('/', productController.getProduct);
router.get('/archive', productController.getArchiveProduct);
router.get('/search', productController.searchProduct);
router.get('/:id', productController.getSpecificProduct);
router.get('/stocks/total', productController.getStocksTotal);
// Admin-only routes
router.post('/createproduct', upload.array('images', 5), productController.createProduct);
router.patch('/:id', upload.array('images', 5), productController.updateProduct);
router.patch('/restore/:id', productController.restoreProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;