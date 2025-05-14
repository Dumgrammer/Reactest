import axios from "axios"
import { baseUrl } from "../Constants/BaseUrl"
import {
    addItemToCart,
    removeItemToCart,
    clearItemsInCart,

    cartSaveShippingAddress,
    savePaymentMethod
} from "../Constants/Cart"


export const addToCartAction = async (id: string, quantity: number = 1, size: string, type: string) => {
    try {
        const { data } = await axios.get(`${baseUrl}/api/products/${id}`);
        const cartItem = {
            _id: data.data._id,
            name: data.data.name,
            image: data.data.image,
            price: data.data.price,
            size: size,
            type: type,
            quantity: Number(quantity) || 1
        };
        
        // Get existing cart items
        const existingCartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        
        // Check if item with same ID, size, and type already exists
        const existingItemIndex = existingCartItems.findIndex(
            (item: any) => item._id === id && item.size === size && item.type === type
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            existingCartItems[existingItemIndex].quantity += Number(quantity) || 1;
        } else {
            // Add new item if it doesn't exist
            existingCartItems.push(cartItem);
        }

        localStorage.setItem("cartItems", JSON.stringify(existingCartItems));
        
        return { success: true, cartItems: existingCartItems };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to add to cart" };
    }
}

export const removeItemToCartAction = (index: number) => {
    try {
        // Get current cart items
        const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        
        // Remove item at the specified index
        const updatedCart = cartItems.filter((_: any, i: number) => i !== index);
        
        // Update localStorage
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('cartUpdated'));
        
        return {
            success: true,
            cartItems: updatedCart
        };
    } catch (error) {
        console.error('Error removing item:', error);
        return {
            success: false,
            message: 'Failed to remove item from cart'
        };
    }
};

export const saveShippingAddressAction = (data: { 
    address: string; 
    city: string; 
    code: string; 
    country: string; 
}) => (dispatch: any) => {
    dispatch({ 
        type: cartSaveShippingAddress, 
        payload: data 
    });

    localStorage.setItem("shippingAddress", JSON.stringify(data));
};

export const savePaymentMethodAction = (data: string[]) => (dispatch: any) => {
    dispatch({ 
        type: savePaymentMethod, 
        payload: data 
    });
    
    localStorage.setItem("paymentMethod", JSON.stringify(data));
}
