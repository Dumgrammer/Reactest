const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminLogger = require('../utils/AdminLogger');

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

// Log admin actions middleware
const logAdminAction = (action) => (req, res, next) => {
    // Skip if not an admin user
    if (!req.user || !req.user.isAdmin) {
        return next();
    }
    
    adminLogger.logAdminActivity(
        req.user.id, 
        req.user.name || 'Unknown Admin',
        action,
        {
            productId: req.params.id,
            ip: req.ip || req.connection.remoteAddress
        }
    );
    
    next();
};

// Regular product routes
router.get('/', productController.getProduct);
router.get('/archive', productController.getArchiveProduct);
router.get('/search', productController.searchProduct);
router.get('/:id', productController.getSpecificProduct);

// Admin-only routes with logging
router.post('/createproduct', upload.array('images', 5), productController.createProduct);
router.patch('/:id', upload.array('images', 5), productController.updateProduct);
router.patch('/restore/:id', productController.restoreProduct);
router.delete('/:id', productController.deleteProduct);


// Admin routes for all products and logs

router.get('/admin/logs', (req, res) => {
    try {
        const logs = adminLogger.getAdminLogs();
        return res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve admin logs",
            error: error.message
        });
    }
});

module.exports = router;