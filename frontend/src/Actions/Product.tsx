import axios from "axios";
import { baseUrl } from "../Constants/BaseUrl";

export const fetchProducts = async () => {
    try {
        const { data } = await axios.get(`${baseUrl}/api/products`);
        return { success: true, products: data };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || "Failed to fetch products" };
    }
};

export const productDetailAction = async (id: string) => {
    try {
        const { data } = await axios.get(`${baseUrl}/api/products/${id}`);
        return { success: true, product: data };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || "Failed to fetch product details" };
    }
};


export const addProductAction = async (productData: FormData) => {
    try {
        const { data } = await axios.post(
            `${baseUrl}/api/products/createproduct`,
            productData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        if (!data.success) {
            throw new Error(data.message || "Failed to add product");
        }

        console.log("Product Added:", data);
        return data;
    } catch (error: any) {
        console.error("Product Add Error:", error.response?.data || error.message);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.response?.status === 413) {
            throw new Error("File size too large. Maximum size is 5MB per image.");
        } else if (error.response?.status === 415) {
            throw new Error("Invalid file type. Only JPG, JPEG, PNG, and WEBP files are allowed.");
        }
        throw new Error(error.message || "Error adding product. Please try again.");
    }
};

export const productDeleteAction = async (id: string) => {
    try {
        const { data } = await axios.delete(`${baseUrl}/api/products/${id}`);
        return { success: true, product: data };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || "Failed to fetch product details" };
    }
};

export const updateProductAction = async (id: string, productData: FormData) => {
    try {
        const { data } = await axios.patch(
            `${baseUrl}/api/products/${id}`,
            productData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        console.log("Product Updated:", data);
        return { success: true, product: data };
    } catch (error: any) {
        console.error("Product Update Error:", error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || "Failed to update product" };
    }
};

export const addToCart = (product: { _id: string; name: string; image: string; price: number; size?: string; quantity?: number }) => {
    // Check if user is logged in
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
        throw new Error("Please login to add items to cart");
    }

    const cartKey = "cartItems";
    const cart: any[] = JSON.parse(localStorage.getItem(cartKey) || "[]");

    const existingIndex = cart.findIndex(item => 
        item._id === product._id && 
        (!product.size || item.size === product.size)
    );

    if (existingIndex !== -1) {
        // If item exists, update quantity
        cart[existingIndex].quantity += (product.quantity || 1);
    } else {
        // If item doesn't exist, add it with quantity
        cart.push({ 
            ...product, 
            quantity: product.quantity || 1,
            size: product.size || null
        });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    // Dispatch a custom event to notify components about cart updates
    window.dispatchEvent(new Event('cartUpdated'));
};

