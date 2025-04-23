import axios from "axios";
import { baseUrl } from "../Constants/BaseUrl";

export const fetchProducts = async () => {
    try {
        const { data } = await axios.get(`${baseUrl}/api/products`);
        return { success: true, products: data };
    } catch (error: any) {
        console.error("Product fetch error:", error);
        return { success: false, message: error.response?.data?.message || "Failed to fetch products" };
    }
};

export const fetchArchivedProducts = async () => {
    try {
        const { data } = await axios.get(`${baseUrl}/api/products/archive`);
        return { success: true, products: data };
    } catch (error: any) {
        console.error("Archived product fetch error:", error);
        return { success: false, message: error.response?.data?.message || "Failed to fetch archived products" };
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

        console.log("Product Added:", data);
        return { success: true, product: data };
    } catch (error: any) {
        console.error("Product Add Error:", error.response?.data || error.message);
        if (error.response?.data?.message) {
            return { success: false, message: error.response.data.message };
        } else if (error.response?.status === 413) {
            return { success: false, message: "File size too large. Maximum size is 5MB per image." };
        } else if (error.response?.status === 415) {
            return { success: false, message: "Invalid file type. Only JPG, JPEG, PNG, and WEBP files are allowed." };
        }
        return { success: false, message: error.message || "Error adding product. Please try again." };
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

export const productRestoreAction = async (id: string) => {
    try {
        const { data } = await axios.patch(`${baseUrl}/api/products/${id}`);
        return { success: true, product: data };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || "Failed to fetch product details" };
    }
};

export const searchProducts = async (query: string, category?: string) => {
    try {
        const params: any = {};
        if (query) params.name = query;
        if (category) params.category = category;
        
        const { data } = await axios.get(`${baseUrl}/api/products/search`, { params });
        return { success: true, products: data };
    } catch (error: any) {
        return { 
            success: false, 
            message: error.response?.data?.message || "Failed to search products",
            products: { data: [] } 
        };
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

export const addToCart = (product: { _id: string; name: string; image: string; price: number; size?: string; type?: string; quantity?: number }) => {
    // Check if user is logged in
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
        throw new Error("Please login to add items to cart");
    }

    const cartKey = "cartItems";
    const cart: any[] = JSON.parse(localStorage.getItem(cartKey) || "[]");

    const existingIndex = cart.findIndex(item => 
        item._id === product._id && 
        (!product.size || item.size === product.size) &&
        (!product.type || item.type === product.type)
    );

    if (existingIndex !== -1) {
        // If item exists, update quantity
        cart[existingIndex].quantity += (product.quantity || 1);
    } else {
        // If item doesn't exist, add it with quantity
        cart.push({ 
            ...product, 
            quantity: product.quantity || 1,
            size: product.size || null,
            type: product.type || null
        });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    // Dispatch a custom event to notify components about cart updates
    window.dispatchEvent(new Event('cartUpdated'));
};

// Get all unique categories from products
export const getCategories = async () => {
    try {
        const response = await fetchProducts();
        if (!response.success) {
            return { success: false, categories: [] };
        }
        
        // Extract unique categories from products
        const products = response.products.data || [];
        const categories = Array.from(new Set(products.map((product: any) => product.category)));
        
        return { 
            success: true, 
            categories 
        };
    } catch (error: any) {
        return { 
            success: false, 
            message: error.message || "Failed to fetch categories",
            categories: [] 
        };
    }
};

// Get all unique types from products
export const getTypes = async () => {
    try {
        const response = await fetchProducts();
        if (!response.success) {
            return { success: false, types: [] };
        }
        
        // Extract unique types from products (flattening the arrays)
        const products = response.products.data || [];
        const allTypes: string[] = [];
        
        products.forEach((product: any) => {
            if (Array.isArray(product.type)) {
                product.type.forEach((type: string) => {
                    if (type && !allTypes.includes(type)) {
                        allTypes.push(type);
                    }
                });
            }
        });
        
        return { 
            success: true, 
            types: allTypes 
        };
    } catch (error: any) {
        return { 
            success: false, 
            message: error.message || "Failed to fetch types",
            types: [] 
        };
    }
};

// Get all unique sizes from products
export const getSizes = async () => {
    try {
        const response = await fetchProducts();
        if (!response.success) {
            return { success: false, sizes: [] };
        }
        
        // Extract unique sizes from products (flattening the arrays)
        const products = response.products.data || [];
        const allSizes: string[] = [];
        
        products.forEach((product: any) => {
            if (Array.isArray(product.size)) {
                product.size.forEach((size: string) => {
                    if (size && !allSizes.includes(size)) {
                        allSizes.push(size);
                    }
                });
            }
        });
        
        return { 
            success: true, 
            sizes: allSizes 
        };
    } catch (error: any) {
        return { 
            success: false, 
            message: error.message || "Failed to fetch sizes",
            sizes: [] 
        };
    }
};

// Fetch all products for admin (including archived)
export const fetchAdminProducts = async () => {
    try {
        const { data } = await axios.get(`${baseUrl}/api/products`);
        console.log("Admin products fetched:", data);
        return { success: true, products: data };
    } catch (error: any) {
        console.error("Admin product fetch error:", error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || "Failed to fetch admin products" };
    }
};

// Fetch admin activity logs
export const fetchAdminLogs = async () => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.data?.token;
        
        if (!token) {
            return { success: false, message: "Admin authentication required" };
        }

        const { data } = await axios.get(`${baseUrl}/api/products/admin/logs`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return { success: true, logs: data.data };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || "Failed to fetch admin logs" };
    }
};

