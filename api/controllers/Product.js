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

exports.addNewProduct = async(req, res) => {
    try {
        
        const { name, image, description, rating, numReview, price, countInStock } = req.body;
        
    } catch (error) {
        
    }
}