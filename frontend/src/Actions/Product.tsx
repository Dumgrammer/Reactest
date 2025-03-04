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


