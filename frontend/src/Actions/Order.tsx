import axios from "axios";
import { baseUrl } from "../Constants/BaseUrl";

// Types
export interface OrderItem {
    name: string;
    qty: string;
    image: string;
    price: string;
    product: string;
}

export interface ShippingAddress {
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface PaymentResult {
    id: string;
    status: string;
    updated_time: string;
    email_address: string;
}

export interface Order {
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    paymentResult?: PaymentResult;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: Date;
}

// New interface for order status and filtering
export interface OrderFilters {
    paymentStatus?: 'paid' | 'unpaid' | 'all';
    deliveryStatus?: 'delivered' | 'pending' | 'all';
    dateRange?: {
        start: Date;
        end: Date;
    };
}

// PayMongo configuration
const PAYMONGO_SECRET_KEY = 'sk_test_vZcfeiVTEqS3MCHDR7mG8zep';
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

const paymongoAxios = axios.create({
    baseURL: PAYMONGO_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
    }
});

// Create GCash Checkout Session
export const createGcashCheckout = async (cart: any[], total: number) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo.data?._id) {
            throw new Error("Please login to place an order");
        }

        const response = await paymongoAxios.post('/checkout_sessions', {
            data: {
                attributes: {
                    billing: {
                        name: userInfo.data.name || "Customer",
                        email: userInfo.data.email || "customer@example.com"
                    },
                    send_email_receipt: true,
                    show_description: true,
                    show_line_items: true,
                    payment_method_types: ["gcash"],
                    cancel_url: `${window.location.origin}/payment`,
                    success_url: `${window.location.origin}/payment/success`,
                    description: "Campus Cart Order",
                    line_items: cart.map(item => ({
                        currency: "PHP",
                        amount: Math.round(item.price * 100), // Convert to cents
                        description: `${item.name}`,
                        name: item.name,
                        quantity: item.quantity
                    }))
                }
            }
        });

        localStorage.getItem("cartItems") && localStorage.removeItem("cartItems");
        return response.data;
    } catch (error: any) {
        console.error('PayMongo error:', error.response?.data);
        throw new Error(error.response?.data?.errors?.[0]?.detail || 'GCash checkout creation failed');
    }
};

// Create Order with GCash
export const createGcashOrder = async (cart: any[], total: number) => {
    try {
        // Get user info for address
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo.data?._id) {
            throw new Error("Please login to place an order");
        }

        // Fetch user profile for address information
        const profileResponse = await fetch(`${baseUrl}/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${userInfo.data.token}`
            }
        });
        
        const profileData = await profileResponse.json();
        const userAddress = profileData.data.address || {
            address: "Test Address",
            city: "Test City",
            postalCode: "1234",
            country: "Philippines"
        };

        // 1. Create the order first
        const orderResponse = await createOrder({
            orderItems: cart.map(item => ({
                name: item.name,
                qty: item.quantity.toString(),
                image: item.image,
                price: item.price.toString(),
                product: item._id
            })),
            paymentMethod: 'gcash',
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: total,
            shippingAddress: {
                address: userAddress.street || "Test Address",
                city: userAddress.city || "Test City",
                postalCode: userAddress.postalCode || "1234",
                country: userAddress.country || "Philippines"
            }
        });

        if (!orderResponse.success) {
            throw new Error(orderResponse.message);
        }

        // 2. Create PayMongo checkout session
        const checkoutSession = await createGcashCheckout(cart, total);
        
        if (checkoutSession.data?.attributes?.checkout_url) {
            return {
                success: true,
                checkoutUrl: checkoutSession.data.attributes.checkout_url,
                orderId: orderResponse.data._id
            };
        } else {
            throw new Error("No checkout URL provided");
        }
        localStorage.removeItem("cartItems");
    } catch (error: any) {
        console.error('Order creation error:', error);
        return {
            success: false,
            message: error.message || "Failed to create order and checkout"
        };
    }
};

// Create Order
export const createOrder = async (orderData: Partial<Order>) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo.data?._id) {
            throw new Error("Please login to place an order");
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.data.token}`
            }
        };

        // Add user ID to order data
        const orderWithUser = {
            ...orderData,
            user: userInfo.data._id
        };

        const { data } = await axios.post(
            `${baseUrl}/api/orders`,
            orderWithUser,
            config
        );
        return { success: true, data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create order'
        };
    }
};

// Create Cash on Pickup Order
export const createCashOnPickupOrder = async (cart: any[], total: number) => {
    try {
        // Get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo.data?._id) {
            throw new Error("Please login to place an order");
        }

        // Fetch user profile for address information
        const profileResponse = await fetch(`${baseUrl}/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${userInfo.data.token}`
            }
        });
        
        const profileData = await profileResponse.json();
        const userAddress = profileData.data.address || {
            address: "Test Address",
            city: "Test City",
            postalCode: "1234",
            country: "Philippines"
        };

        // Format order data
        const orderData = {
            orderItems: cart.map(item => ({
                name: item.name,
                qty: item.quantity.toString(),
                image: item.image,
                price: item.price.toString(),
                product: item._id
            })),
            paymentMethod: 'pickup',
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: total,
            shippingAddress: {
                address: userAddress.street || "Test Address",
                city: userAddress.city || "Test City",
                postalCode: userAddress.postalCode || "1234",
                country: userAddress.country || "Philippines"
            },
            user: userInfo.data._id
        };

        const response = await fetch(`${baseUrl}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.data.token}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create order');
        }

        return { success: true, data };
        localStorage.removeItem("cartItems");
        
    } catch (error: any) {
        console.error('Order error:', error);
        return {
            success: false,
            message: error.message || "Order creation failed"
        };
    }
};

// Fetch all orders
export const fetchOrders = async () => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo.data?._id) {
            throw new Error("Please login to view orders");
        }

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.data.token}`
            }
        };

        const { data } = await axios.get(`${baseUrl}/api/orders`, config);

        console.log(data);

        return { 
            success: true, 
            orders: data.data 
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch orders'
        };
    }
};

// Get specific order
export const getOrderById = async (orderId: string) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo.data?._id) {
            throw new Error("Please login to view order details");
        }

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.data.token}`
            }
        };

        const { data } = await axios.get(`${baseUrl}/api/orders/${orderId}`, config);
        return { 
            success: true, 
            order: data.data 
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch order details'
        };
    }
};

// Update order payment status
export const updateOrderPayment = async (orderId: string, paymentData: PaymentResult) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo.data?._id) {
            throw new Error("Please login to update order");
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        };

        const { data } = await axios.put(
            `${baseUrl}/api/orders/${orderId}/payment`,
            paymentData,
            config
        );
        return { 
            success: true, 
            order: data.data 
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update payment status'
        };
    }
};

// Utility function to sort and filter orders
export const processOrders = (orders: any[], filters: OrderFilters) => {
    let processedOrders = [...orders];

    // Filter by payment status
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        processedOrders = processedOrders.filter(order => 
            filters.paymentStatus === 'paid' ? order.isPaid : !order.isPaid
        );
    }

    // Filter by delivery status
    if (filters.deliveryStatus && filters.deliveryStatus !== 'all') {
        processedOrders = processedOrders.filter(order => 
            filters.deliveryStatus === 'delivered' ? order.isDelivered : !order.isDelivered
        );
    }

    // Filter by date range
    if (filters.dateRange) {
        processedOrders = processedOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= filters.dateRange!.start && 
                   orderDate <= filters.dateRange!.end;
        });
    }

    // Sort by date (newest first)
    processedOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return processedOrders;
};

// Fetch user's personal order history
export const fetchUserOrders = async () => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo.data?._id) {
            throw new Error("Please login to view your orders");
        }

        const { data } = await axios.get(`${baseUrl}/api/orders/myorders/${userInfo.data._id}`, {
        });
        
        return { 
            success: true, 
            orders: data.data 
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch your orders'
        };
    }
};

// Fetch a specific user's order by ID
export const fetchUserOrderById = async (orderId: string) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo.data?._id) {
            throw new Error("Please login to view your order details");
        }

        const { data } = await axios.get(`${baseUrl}/api/orders/myorders/${userInfo.data._id}/${orderId}`, {
        });
        
        return { 
            success: true, 
            order: data.data 
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch your order details'
        };
    }
};

// Update order payment and delivery status
export const updateOrderStatus = async (orderId: string, statusType: 'payment' | 'delivery', value: boolean) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo.data?._id) {
            throw new Error("Please login to update order status");
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.data.token}`
            }
        };

        // Construct the payload based on status type
        const payload = statusType === 'payment' 
            ? { isPaid: value, userInfo: JSON.stringify(userInfo) }
            : { isDelivered: value, userInfo: JSON.stringify(userInfo) };

        const { data } = await axios.put(
            `${baseUrl}/api/orders/${orderId}/status`,
            payload,
            config
        );
        
        return { 
            success: true, 
            order: data.data 
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || `Failed to update ${statusType} status`
        };
    }
};

// Get all gcash orders
export const getGcashOrders = async () => {
    try {
        const response = await axios.get(`${baseUrl}/api/orders/totals/gcash`);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch gcash orders'
        };
    }
};  

// Get all cash orders
export const getCashOrders = async () => {
    try {
        const response = await axios.get(`${baseUrl}/api/orders/totals/cash`);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch cash orders'
        };
    }
};



