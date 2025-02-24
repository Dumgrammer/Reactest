import axios from "axios"
import { baseUrl } from "../Constants/BaseUrl"
import {
    addItemToCart,
    removeItemToCart,
    clearItemsInCart,

    cartSaveShippingAddress,
    savePaymentMethod
} from "../Constants/Cart"


export const addToCartAction = (id: any, quantity: number) => async  (dispatch: any, getState: any) => {
    try {
        const { data } = await axios.get(`${baseUrl}/api/products/${id}`);
        dispatch({ type: addItemToCart, payload: {
            product: data.data._id,
            name: data.data.name,
            image: data.data.image,
            price: data.data.price,
            countInStock: data.data.countInStock,
            quantity: Number(quantity) || 1
        } });
        
        const cartItems = getState().cartReducer.cartItems;
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        console.log("This is", data)

    } catch (error) {
        console.error(error);
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
