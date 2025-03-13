import axios from "axios"
import { baseUrl } from "../Constants/BaseUrl"
import {
    addItemToCart,
    removeItemToCart,
    clearItemsInCart,

    cartSaveShippingAddress,
    savePaymentMethod
} from "../Constants/Cart"


export const addToCartAction = async (id: string, quantity: number = 1) => {
    try {
        const { data } = await axios.get(`${baseUrl}/api/products/${id}`);
        const cartItem = {
            product: data.data._id,
            name: data.data.name,
            image: data.data.image,
            price: data.data.price,
            countInStock: data.data.countInStock,
            quantity: Number(quantity) || 1
        };
        
        // Get existing cart items
        const existingCartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
        existingCartItems.push(cartItem);
        localStorage.setItem("cartItems", JSON.stringify(existingCartItems));
        
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to add to cart" };
    }
}

export const removeItemToCartAction = (id: string) => (dispatch: any, getState: any) => {
    const cartState = getState().cart || { cartItems: [] };
    dispatch({
        type: removeItemToCart,
        payload: id
    });

    localStorage.setItem("cartItems", JSON.stringify(cartState.cartItems));
}

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
