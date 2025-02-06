import { Action } from "redux";
import {
    addItemToCart,
    removeItemToCart,
    clearItemsInCart,

    cartSaveShippingAddress,
    savePaymentMethod
} from "../Constants/Cart"

interface CartItem {
    product: string;
    quantity: number;
}

interface ShippingAddress {
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

interface CartState {
    cartItems: CartItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
}

const initialState: CartState = {
    cartItems: [],
    shippingAddress: { address: '', city: '', postalCode: '', country: '' },
    paymentMethod: ''
};

interface ActionType extends Action {
    payload?: any,
    [key: string]: any;
}

export const cartReducer = (state: CartState = initialState, action: ActionType): CartState => {
    switch (action.type) {
        case addItemToCart:
            const item = action.payload as CartItem;
            const existingItem = state.cartItems.find((spec) => spec.product === item.product);

            if (!existingItem) {
                return {
                    ...state,
                    cartItems: [...state.cartItems, item]
                };
            }

            return {
                ...state,
                cartItems: state.cartItems.map((prod) =>
                    prod.product === existingItem.product ? item : prod
                ),
            };

        case removeItemToCart:
            return {
                ...state,
                cartItems: state.cartItems.filter((added) => added.product !== action.payload)
            };

        case savePaymentMethod:
            return {
                ...state,
                paymentMethod: action.payload as string
            };

        case cartSaveShippingAddress:
            return {
                ...state,
                shippingAddress: action.payload as ShippingAddress
            };

        case clearItemsInCart:
            return {
                ...state,
                cartItems: []
            };

        default:
            return state;
    }
};