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
        const { data } = await axios.post(`${baseUrl}/api/products/${id}`);
        dispatch({ type: addItemToCart, payload: {
            product: data._id,
            name: data.name,
            image: data.image,
            price: data.price,
            countInStock: data.countInStock,
            quantity
        } });
        
        const cartItems = getState().cartReducer.cartItems;
        localStorage.setItem("cartItems", JSON.stringify(cartItems));

    } catch (error) {
        console.error(error);
    }
}

export const removeItemToCartAction = (id: number) => (dispatch: any, getState: any) => {
    dispatch({
        type: removeItemToCart,
        payload: id
    });

    localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
}

export const saveShippingAddressAction = (data: string[]) => (dispatch: any) => {
    dispatch({ 
        type: cartSaveShippingAddress, 
        payload: data 
    });
    
    localStorage.setItem("shippinAddress", JSON.stringify(data));
}

export const savePaymentMethodAction = (data: string[]) => (dispatch: any) => {
    dispatch({ 
        type: savePaymentMethod, 
        payload: data 
    });
    
    localStorage.setItem("paymentMethod", JSON.stringify(data));
}
