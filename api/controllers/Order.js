const Order = require('../models/Order');
const Product = require('../models/Product');
const send = require('../utils/Response');

exports.orderProduct = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, shippingPrice, taxPrice, totalPrice, price } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return send.sendBadRequestResponse(res, "No items found!");
        }

        // Check if all products exist and have enough stock
        for (const item of orderItems) {
            const existingProduct = await Product.findById(item.product);

            if (!existingProduct) {
                return send.sendNotFoundResponse(res, `Product with ID ${item.product} not available`);
            }

            if (existingProduct.countInStock < item.qty) {
                return send.sendBadRequestResponse(res, `Not enough stock for ${existingProduct.name}`);
            }
        }

        // Create new order
        const order = new Order({
            orderItems,
            shippingAddress,
            paymentMethod,
            shippingPrice,
            price,
            taxPrice,
            totalPrice,
            user: req.user.id,
        });

        const createdOrder = await order.save();
        return send.sendResponse(res, 201, createdOrder, "Order has been placed!");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

exports.orderPayment = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { paymentResult } = req.body;

        const existingOrder = await Order.findById(orderId);

        if (!existingOrder) {
            return send.sendNotFoundResponse(res, "Order not found!");
        }
        
        if (existingOrder.isPaid === true) {
            return send.sendBadRequestResponse(res, "Order is already paid");
        }

        if (existingOrder) {
            existingOrder.isPaid = true;
            existingOrder.paidAt = Date.now();
            existingOrder.paymentResult = paymentResult;
        }

        const updatedOrder = await existingOrder.save();

        return send.sendResponse(res, 200, updatedOrder, "Order has been paid successfully!");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
}

exports.getAllOrders = async (req, res) => {
    try {
        
        const existingOrder = await Order.find({});

        if (!existingOrder) {
            return send.sendNotFoundResponse(res, "No orders have been placed yet");
        }

        return send.sendResponse(res, 200, existingOrder, "Here are the list of your orders!");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
}

exports.getSpecificOrders = async (req, res) => {
    try {
        
        const id = req.params.id
        const existingOrder = await Order.findById(id);

        if (!existingOrder) {
            return send.sendNotFoundResponse(res, "No orders have been placed yet");
        }

        return send.sendResponse(res, 200, existingOrder, "Here's the order");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
}

