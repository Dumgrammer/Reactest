import axios from "axios";
import { baseUrl } from "../Constants/BaseUrl";
import { AppDispatch } from "../Store";

import { 
    productListReq,
    productListReqSucess,
    productListReqFail,

    productDetailReq,
    productDetailReqSuccess,
    productDetailReqFail,
    productAddFail,
    productAddReq,
    productAddSuccess
 }  from "../Constants/Product";

export const productListAction = () => async (dispatch: AppDispatch) => {
    try {
        dispatch({type: productListReq})

        const { data } = await axios.get(`${baseUrl}/api/products`);

        dispatch({type: productListReqSucess, payload: data});
    } catch (error: any) {
        dispatch({type: productListReqFail, payload: error.response && error.response.data.message ? error.response.data.message : error.message });
    }
}

export const productDetailAction = (id: any) => async (dispatch: AppDispatch) => {
    try {
        dispatch({type: productDetailReq})

        const data = await axios.get(`${baseUrl}/api/products/${id}`);
        
        dispatch({type: productDetailReqSuccess, payload: data});
    } catch (error: any) {
        dispatch({type: productDetailReqFail, payload: error.response && error.response.data.message ? error.response.data.message : error.message });
    }
}

export const addProductAction = (productData: FormData) => async (dispatch: AppDispatch) => {
    try {
        dispatch({ type: productAddReq });

        const { data } = await axios.post(`${baseUrl}/api/products/createproduct`, productData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("Product Added:", data);

        dispatch({ type: productAddSuccess, payload: data });

    } catch (error: any) {
        console.error("Product Add Error:", error.response?.data || error.message);
        
        dispatch({
            type: productAddFail,
            payload: error.response?.data?.message || error.message,
        });
    }
};


