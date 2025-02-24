import axios from 'axios';
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

} from '../Constants/Order';
import { clearItemsInCart } from '../Constants/Cart';
import { baseUrl } from '../Constants/BaseUrl';
import { userLogoutAction } from './User';

export const orderAction = (order: any) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: orderReq })
        const userInfo = getState().userLoginReducer.userInfo;
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}`,

            }
        }
        const { data } = await axios.post(
            `${baseUrl}/api/orders`,
            order,
            config
        );
        
        dispatch({ type: orderSuccess, payload: data });
        dispatch({ type: clearItemsInCart, payload: data });
    } catch (error) {
        console.log(error)
    }
}

//order payment

export const orderPaymentAction =
    (orderId: string, paymentResult: any) => async (dispatch: any, getState: any) => {
        try {
            dispatch({ type: orderPaymentReq });
            const userInfo = getState().userLoginReducer.userInfo;
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.put(
                `${baseUrl}/api/orders/${orderId}/payment`,
                paymentResult,
                config
            );

            dispatch({ type: orderPaymentReqSuccess, payload: data });
            dispatch(orderDetailAction(orderId))

        } catch (error: any) {
            const message =
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;

            if (message === "Not authroized!") {
                dispatch(userLogoutAction());
            }
            dispatch({
                type: orderPaymentReqFail,
                payload: message,
            });
        }
    };


//detail req

export const orderDetailAction = (id: string) => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: orderDetailReq });
        const userInfo = getState().userLoginReducer.userInfo;
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}`,
            },
        };
        const { data } = await axios.get(
            `${baseUrl}/api/orders/${id}`,

            config
        );
        dispatch({ type: orderDetailReqSuccess, payload: data });
    } catch (error: any) {
        const message =
            error.response && error.response.data.message
                ? error.response.data.message
                : error.message;

        if (message === "Not authroized!") {
            dispatch(userLogoutAction());
        }
        dispatch({
            type: orderDetailReqFail,
            payload: message,
        });
    }
};


// order list action

export const orderListAction = () => async (dispatch: any, getState: any) => {
    try {
        dispatch({ type: orderListReq });
        const userInfo = getState().userLoginReducer.userInfo;

        const config = {
            headers: {

                Authorization: `Bearer ${userInfo.token}`,
            },
        };
        const { data } = await axios.get(
            `${baseUrl}/api/orders`,
            config
        );
        dispatch({ type: orderListReqSuccess, payload: data });
    } catch (error: any) {
        const message =
            error.response && error.response.data.message
                ? error.response.data.message
                : error.message;

        if (message === "Not authroized!") {
            dispatch(userLogoutAction());
        }
        dispatch({
            type: orderListReqFail,
            payload: message,
        });
    }
};
