const Order = require('../models/Order');
const Product = require('../models/Product');
const send = require('../utils/Response');
const User = require('../models/User');
const Logs = require('../models/Logs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "appgradesolutionsgcccsaco@gmail.com",
        pass: "eyqq yjeo ycqo peat",
    },
    logger: true,
    debug: true,
});

// Function to send delivery notification email
const sendDeliveryNotification = async (userEmail, orderId) => {
    try {
        const mailOptions = {
            from: '"Your Store" <appgradesolutionsgcccsaco@gmail.com>',
            to: userEmail,
            subject: "Your Order is Ready for Pickup!",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background-color: #f9f9f9;
                            border-radius: 5px;
                            padding: 20px;
                            margin-top: 20px;
                            margin-bottom: 20px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .header h1 {
                            color: #2c3e50;
                            margin-bottom: 10px;
                        }
                        .order-id {
                            background-color: #2c3e50;
                            color: white;
                            padding: 15px;
                            border-radius: 5px;
                            text-align: center;
                            font-size: 18px;
                            font-weight: bold;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            font-size: 12px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Order Ready for Pickup!</h1>
                        </div>
                        <p>Dear Valued Customer,</p>
                        <p>We are pleased to inform you that your order is now ready for pickup!</p>
                        <div class="order-id">
                            Order ID: #${orderId.toString().slice(-6).toUpperCase()}
                        </div>
                        <p>Please visit our store to collect your order. Don't forget to bring a valid ID for verification.</p>
                        <p>Thank you for choosing our store!</p>
                        <div class="footer">
                            <p>This is an automated message, please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending delivery notification:", error);
        return false;
    }
};

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

            // If product doesn't have size/type, check countInStock directly
            if (!existingProduct.size?.length && !existingProduct.type?.length) {
                if (existingProduct.countInStock < parseInt(item.qty)) {
                    return send.sendBadRequestResponse(res, 
                        `Not enough stock for ${existingProduct.name}`
                    );
                }
            } else {
                // Check inventory for specific size and type
                const inventoryItem = existingProduct.inventory.find(
                    inv => (!item.size || inv.size === item.size) && 
                           (!item.type || inv.type === item.type)
                );

                if (!inventoryItem || inventoryItem.quantity < parseInt(item.qty)) {
                    return send.sendBadRequestResponse(res, 
                        `Not enough stock for ${existingProduct.name}${item.size ? ` (Size: ${item.size})` : ''}${item.type ? ` (Type: ${item.type})` : ''}`
                    );
                }
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

        // Update product inventory and stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                // If product doesn't have size/type, update countInStock directly
                if (!product.size?.length && !product.type?.length) {
                    product.countInStock -= parseInt(item.qty);
                } else {
                    // Find and update the specific inventory item
                    const inventoryItem = product.inventory.find(
                        inv => (!item.size || inv.size === item.size) && 
                               (!item.type || inv.type === item.type)
                    );
                    
                    if (inventoryItem) {
                        inventoryItem.quantity -= parseInt(item.qty);
                    }

                    // Update total stock count
                    product.countInStock = product.inventory.reduce(
                        (sum, inv) => sum + inv.quantity, 
                        0
                    );
                }

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

        // Update product inventory and stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                // If product doesn't have size/type, update countInStock directly
                if (!product.size?.length && !product.type?.length) {
                    product.countInStock -= parseInt(item.qty);
                } else {
                    // Find and update the specific inventory item
                    const inventoryItem = product.inventory.find(
                        inv => (!item.size || inv.size === item.size) && 
                               (!item.type || inv.type === item.type)
                    );
                    
                    if (inventoryItem) {
                        inventoryItem.quantity -= parseInt(item.qty);
                    }

                    // Update total stock count
                    product.countInStock = product.inventory.reduce(
                        (sum, inv) => sum + inv.quantity, 
                        0
                    );
                }

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
        const existingOrder = await Order.find({})
            .populate('user', 'firstname middlename lastname email');

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
        const { isPaid, isDelivered, userInfo } = req.body;
        const orderId = req.params.id;
        
        const order = await Order.findById(orderId).populate('user', 'email');
        
        if (!order) {
            return send.sendNotFoundResponse(res, "Order not found");
        }

        // Parse user info from request body
        let adminUser;
        try {
            adminUser = JSON.parse(userInfo).data;
        } catch (error) {
            console.error("Error parsing user info:", error);
            return send.sendBadRequestResponse(res, "Invalid user information");
        }
        
        // Update payment status if provided
        if (isPaid !== undefined) {
            const oldStatus = order.isPaid;
            order.isPaid = isPaid;
            // If marking as paid, set the payment date
            if (isPaid && !order.paidAt) {
                order.paidAt = Date.now();
            }

            // Log payment status change
            if (oldStatus !== isPaid) {
                try {
                    // Create a log for each product in the order
                    for (const item of order.orderItems) {
                        await Logs.create({
                            user: adminUser._id,
                            action: 'update',
                            reason: `Order #${order._id.toString().slice(-6)} payment status changed to ${isPaid ? 'paid' : 'unpaid'}`,
                            productId: item.product,
                            userDetails: {
                                fullName: adminUser.name,
                                email: adminUser.email
                            }
                        });
                    }
                } catch (logError) {
                    console.error("Error creating payment status log:", logError);
                }
            }
        }
        
        // Update delivery status if provided
        if (isDelivered !== undefined) {
            const oldStatus = order.isDelivered;
            order.isDelivered = isDelivered;
            // If marking as delivered, set the delivery date
            if (isDelivered && !order.deliveredAt) {
                order.deliveredAt = Date.now();
                
                // Send delivery notification email
                if (order.user && order.user.email) {
                    await sendDeliveryNotification(order.user.email, order._id);
                }
            }

            // Log delivery status change
            if (oldStatus !== isDelivered) {
                try {
                    // Create a log for each product in the order
                    for (const item of order.orderItems) {
                        await Logs.create({
                            user: adminUser._id,
                            action: 'update',
                            reason: `Order #${order._id.toString().slice(-6)} delivery status changed to ${isDelivered ? 'delivered' : 'pending'}`,
                            productId: item.product,
                            userDetails: {
                                fullName: adminUser.name,
                                email: adminUser.email
                            }
                        });
                    }
                } catch (logError) {
                    console.error("Error creating delivery status log:", logError);
                }
            }
        }
        
        const updatedOrder = await order.save();
        
        return send.sendResponse(res, 200, updatedOrder, "Order status updated successfully");
    } catch (error) {
        console.error("Order status update error:", error);
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