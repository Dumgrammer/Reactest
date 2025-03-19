const Order = require('../models/Order');
const Product = require('../models/Product');
const send = require('../utils/Response');

exports.orderProduct = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice, user } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return send.sendBadRequestResponse(res, "No items found!");
        }

        if (!user) {
            return send.sendBadRequestResponse(res, "User ID is required!");
        }

        // Check if all products exist and have enough stock
        for (const item of orderItems) {
            const existingProduct = await Product.findById(item.product);

            if (!existingProduct) {
                return send.sendNotFoundResponse(res, `Product with ID ${item.product} not available`);
            }

            if (existingProduct.countInStock < parseInt(item.qty)) {
                return send.sendBadRequestResponse(res, `Not enough stock for ${existingProduct.name}`);
            }
        }

        // Create new order
        const order = new Order({
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            user,
            isPaid: paymentMethod === 'gcash'
        });

        const createdOrder = await order.save();

        // Update product stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock -= parseInt(item.qty);
                await product.save();
            }
        }

        return send.sendResponse(res, 201, createdOrder, "Order has been placed!");

    } catch (error) {
        console.error('Order creation error:', error);
        return send.sendISEResponse(res, error);
    }
};

exports.orderPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return send.sendNotFoundResponse(res, "Order not found");
        }

        // Update order payment status
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address
        };

        const updatedOrder = await order.save();

        // Update product stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock -= parseInt(item.qty);
                await product.save();
            }
        }

        return send.sendResponse(res, 200, updatedOrder, "Payment updated successfully");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

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
};

exports.getSpecificOrders = async (req, res) => {
    try {
        const id = req.params.id;
        const existingOrder = await Order.findById(id);

        if (!existingOrder) {
            return send.sendNotFoundResponse(res, "No orders have been placed yet");
        }

        return send.sendResponse(res, 200, existingOrder, "Here's the order");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

