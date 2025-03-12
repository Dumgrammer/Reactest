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
        const { name, description, category, size, type, rating, numReview, price, countInStock } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required!" });
        }

        // Handle arrays for category and size
        const categories = Array.isArray(req.body['category[]']) ? req.body['category[]'] : [req.body['category[]']];
        const sizes = Array.isArray(req.body['size[]']) ? req.body['size[]'] : [req.body['size[]']];

        if (!categories || categories.length === 0) {
            return res.status(400).json({ message: "At least one category is required!" });
        }

        if (!sizes || sizes.length === 0) {
            return res.status(400).json({ message: "At least one size is required!" });
        }

        console.log("Files uploaded at:", req.files.map(file => file.path));

        const product = new Product({
            name,
            image: req.files.map(file => file.path),
            description,
            category: categories,
            size: sizes,
            type,
            rating,
            numReview,
            price,
            countInStock
        });

        const newProduct = await product.save(); 
        return send.sendResponse(res, 200, newProduct, "Product created successfully!");

    } catch (error) {
        console.log(error)
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

        const updatedProduct = await Product.updateOne({_id: id}, {$set: req.body});

        return send.sendResponse(res, 203, updatedProduct, "Product has been updated successfully!");

    } catch (error) {
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