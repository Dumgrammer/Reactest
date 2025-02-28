const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/Product');

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
        'image/png',
        'image/webp'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid File Type!"), false)
    }
}

const upload = multer({storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get('/', productController.getProduct);
router.get('/:id', productController.getSpecificProduct);

router.post('/createproduct', upload.single('image'), productController.createProduct);

router.patch('/:id', productController.updateProduct);

router.delete('/:id', productController.deleteProduct);

module.exports = router;