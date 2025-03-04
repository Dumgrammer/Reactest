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
            productData
        );

        console.log("Product Added:", data);
        return data;
    } catch (error: any) {
        console.error("Product Add Error:", error.response?.data || error.message);
        throw error;
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


export const addToCart = (product: { _id: string; name: string; image: string; price: number }) => {
    const cartKey = "cartItems";
    const cart: any[] = JSON.parse(localStorage.getItem(cartKey) || "[]");

    const existingIndex = cart.findIndex((item) => item._id === product._id);

    if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
};

