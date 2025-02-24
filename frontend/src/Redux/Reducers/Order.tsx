import { Action } from "redux";
import {
    orderReq,
    orderReset,
    orderSuccess,
    orderFail,

    orderDetailReq,
    orderDetailReqFail,
    orderDetailReqSuccess,

    orderListReq,
    orderListReqFail,
    orderListReqSuccess,

    orderPaymentReq,
    orderPaymentReqFail,
    orderPaymentReqSuccess

} from '../Constants/Order'



interface ActionType extends Action {
    payload?: any,
    [key: string]: any;
}

interface OrderState {
    order: any;
    loading: boolean;
    error: any;
    success?: boolean;
}

interface OrderDetailState {
    order: any;
    loading: boolean;
    error?: any;
    shippingAddress: any;
    orderItems: any[];
    success?: boolean;
}

interface OrderPaymentState {
    order: any;
    loading?: boolean;
    error?: any;
    success?: boolean;
}

interface OrderListState {
    orders: any[];
    loading?: boolean;
    error?: any;
    success?: boolean;
}

export const orderReducer = ( state: OrderState = { order: null, loading: false, error: null }, action: ActionType ): OrderState => {
    switch (action.type) {
        case orderReq:
            return { ...state, loading: true, error: null };

        case orderSuccess:
            return { loading: false, success: true, order: action.payload, error: null };

        case orderFail:
            return { loading: false, error: action.payload, order: null, success: false };

        case orderReset:
            return { order: null, loading: false, error: null };

        default:
            return state;
    }
};

export const orderDetailReducer = ( state: OrderDetailState = { loading: true, order: {}, shippingAddress: {}, orderItems: [] }, action: ActionType ): OrderDetailState => {
    switch (action.type) {
        case orderDetailReq:
            return { ...state, loading: true };

        case orderDetailReqSuccess:
            return {
                loading: false,
                success: true,
                order: action.payload,
                shippingAddress: action.payload.shippingAddress || {},
                orderItems: action.payload.orderItems || [],
                error: null
            };

        case orderDetailReqFail:
            return {
                loading: false,
                error: action.payload,
                order: {},
                shippingAddress: {},
                orderItems: [],
                success: false
            };

        default:
            return state;
    }
};

export const orderPaymentReducer = ( state: OrderPaymentState = { order: {} }, action: ActionType ): OrderPaymentState => {
    switch (action.type) {
        case orderPaymentReq:
            return { ...state, loading: true };

        case orderPaymentReqSuccess:
            return { loading: false, success: true, order: action.payload };

        case orderPaymentReqFail:
            return { loading: false, order: {}, error: action.payload, success: false };

        default:
            return state;
    }
};

export const orderListReducer = ( state: OrderListState = { orders: [] }, action: ActionType ): OrderListState => {
    switch (action.type) {
        case orderListReq:
            return { ...state, loading: true };

        case orderListReqSuccess:
            return { loading: false, success: true, orders: action.payload };

        case orderListReqFail:
            return { loading: false, orders: [], error: action.payload };

        default:
            return state;
    }
};
