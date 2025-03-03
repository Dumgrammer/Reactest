const { where, findById, updateOne } = require('../models/Order');
const Product = require('../models/Product');
const send = require('../utils/Response');

exports.getProduct = async(req, res) => {
    try {
        
        const products = await Product.find({});

        return send.sendResponse(res, 200, products, "Products found!");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
}

exports.getSpecificProduct = async(req, res) => {
    try {
        
        const id = req.params.id;
        const products = await Product.findById(id);

        if (!products) {
            return send.sendNotFoundResponse(res, "Product Not Found!");
        }

        return send.sendResponse(res, 200, products, "Products found!");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
}

exports.createProduct = async (req, res) => {
    try {

        const { name, description, rating, numReview, price, countInStock } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Image upload failed!" });
        }

        console.log("File uploaded at:", req.file.path);

        const product = new Product({
            name,
            image: req.file.path,
            description,
            rating,
            numReview,
            price,
            countInStock
        });

        const newProduct = await product.save(); 
        return send.sendResponse(res, 200, newProduct, "Product created succuesfully!");

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