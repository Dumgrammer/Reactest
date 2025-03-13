const { where, findById, updateOne } = require('../models/Order');
const Product = require('../models/Product');
const send = require('../utils/Response');

exports.getProduct = async (req, res) => {
    try {
        const products = await Product.find({});

        const updatedProducts = products.map(product => {
            const updatedImages = product.image.map(img => {
                if (!img.startsWith("http")) {
                    return `${req.protocol}://${req.get("host")}/${img.replace(/\\/g, "/")}`;
                }
                return img;
            });
            return { ...product.toObject(), image: updatedImages };
        });

        return send.sendResponse(res, 200, updatedProducts, "Products found!");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

exports.getSpecificProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);

        if (!product) {
            return send.sendNotFoundResponse(res, "Product Not Found!");
        }

        // Ensure local images are formatted correctly
        const updatedImages = product.image.map(img => {
            if (!img.startsWith("http")) {
                return `${req.protocol}://${req.get("host")}/${img.replace(/\\/g, "/")}`;
            }
            return img;
        });

        const updatedProduct = { ...product.toObject(), image: updatedImages };
        return send.sendResponse(res, 200, updatedProduct, "Product found!");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description, type, rating, numReview, price, countInStock, category } = req.body;

        // Check for images
        if (!req.files || req.files.length === 0) {
            return send.sendResponse(res, 400, null, "At least one image is required!");
        }

        // Handle arrays for type and size
        const types = Array.isArray(type) ? type : [type];
        const sizes = Array.isArray(req.body.size) ? req.body.size : [req.body.size];

        if (!types || types.length === 0) {
            return send.sendResponse(res, 400, null, "At least one type is required!");
        }

        if (!sizes || sizes.length === 0) {
            return send.sendResponse(res, 400, null, "At least one size is required!");
        }

        if (!category) {
            return send.sendResponse(res, 400, null, "Category is required!");
        }

        // Process image paths
        const imagePaths = req.files.map(file => file.path.replace(/\\/g, "/"));

        const product = new Product({
            name,
            image: imagePaths,
            description,
            category,
            size: sizes,
            type: types,
            rating: Number(rating) || 0,
            numReview: Number(numReview) || 0,
            price: Number(price) || 0,
            countInStock: Number(countInStock) || 0
        });

        const newProduct = await product.save();
        
        // Format the response to include full image URLs
        const formattedProduct = {
            ...newProduct.toObject(),
            image: newProduct.image.map(img => 
                `${req.protocol}://${req.get("host")}/${img}`
            )
        };

        return send.sendResponse(res, 201, formattedProduct, "Product created successfully!");

    } catch (error) {
        console.error("Product creation error:", error);
        return send.sendISEResponse(res, error);
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const existingProduct = await Product.findById(id);
        
        if (!existingProduct) {
            return send.sendNotFoundResponse(res, "Product not found!");
        }

        // Get the basic fields
        const { name, description, type, rating, numReview, price, countInStock, category } = req.body;
        
        // Handle arrays for type and size
        const types = Array.isArray(type) ? type : [type];
        const sizes = Array.isArray(req.body.size) ? req.body.size : [req.body.size];

        // Handle existing images
        let updatedImages = [];
        if (req.body.existingImages) {
            const existingImages = Array.isArray(req.body.existingImages) 
                ? req.body.existingImages 
                : [req.body.existingImages];
            updatedImages = existingImages.map(img => `uploads/${img}`);
        }

        // Add new uploaded images if any
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            updatedImages = [...updatedImages, ...newImages];
        }

        // If no images were provided, keep the existing ones
        if (updatedImages.length === 0) {
            updatedImages = existingProduct.image;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name,
                description,
                type: types,
                rating: Number(rating),
                numReview: Number(numReview),
                price: Number(price),
                countInStock: Number(countInStock),
                category,
                size: sizes,
                image: updatedImages
            },
            { new: true }
        );

        // Format image URLs in the response
        const formattedProduct = {
            ...updatedProduct.toObject(),
            image: updatedProduct.image.map(img => 
                `${req.protocol}://${req.get("host")}/${img.replace(/\\/g, "/")}`
            )
        };

        return send.sendResponse(res, 200, formattedProduct, "Product has been updated successfully!");

    } catch (error) {
        console.error("Product update error:", error);
        return send.sendISEResponse(res, error);
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;

        const existingProduct = await Product.findById(id);
        
        if (!existingProduct) {
            return send.sendNotFoundResponse(res, "Product not found!");
        }

        const deletedProduct = await Product.deleteOne({ _id: id });

        return send.sendResponse(res, 200, deletedProduct, "Product deleted successfully!");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};