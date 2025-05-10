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

exports.getUserOrders = async (req, res) => {
    try {
        // Get userId from query param instead of from the middleware
        const userId = req.params.id;
        
        if (!userId) {
            return send.sendBadRequestResponse(res, "User ID is required");
        }

        const userOrders = await Order.find({ user: userId });

        if (userOrders.length === 0) {
            return send.sendResponse(res, 200, [], "You haven't placed any orders yet");
        }

        return send.sendResponse(res, 200, userOrders, "Here are your orders!");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

exports.getUserOrderById = async (req, res) => {
    try {
        // Get userId and orderId from path parameters
        const userId = req.params.userId;
        const orderId = req.params.orderId;
        
        if (!userId) {
            return send.sendBadRequestResponse(res, "User ID is required");
        }
        
        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            return send.sendNotFoundResponse(res, "Order not found or doesn't belong to you");
        }

        return send.sendResponse(res, 200, order, "Here is your order details");

    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { isPaid, isDelivered } = req.body;
        const orderId = req.params.id;
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return send.sendNotFoundResponse(res, "Order not found");
        }
        
        // Update payment status if provided
        if (isPaid !== undefined) {
            order.isPaid = isPaid;
            // If marking as paid, set the payment date
            if (isPaid && !order.paidAt) {
                order.paidAt = Date.now();
            }
        }
        
        // Update delivery status if provided
        if (isDelivered !== undefined) {
            order.isDelivered = isDelivered;
            // If marking as delivered, set the delivery date
            if (isDelivered && !order.deliveredAt) {
                order.deliveredAt = Date.now();
            }
        }
        
        const updatedOrder = await order.save();
        
        return send.sendResponse(res, 200, updatedOrder, "Order status updated successfully");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};


exports.getGcashOrders = async (req, res) => {
    try {
        const orders = await Order.find({ paymentMethod: 'gcash' });
        const totalPrice = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        return send.sendResponse(res, 200, { totalPrice }, "Total GCash orders amount");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};

exports.getCashOrders = async (req, res) => {
    try {
        const orders = await Order.find({ paymentMethod: 'pickup' });
        const totalPrice = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        return send.sendResponse(res, 200, { totalPrice }, "Total Cash orders amount");
    } catch (error) {
        return send.sendISEResponse(res, error);
    }
};