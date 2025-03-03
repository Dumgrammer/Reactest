import { Action } from "redux";
import {

        productListReq,
        productListReqSucess,
        productListReqFail,

        productDetailReq,
        productDetailReqSuccess,
        productDetailReqFail,

        productAddReq,
        productAddSuccess,
        productAddFail

} from "../Constants/Product";

//Interfaces for proper statecontrol
interface ProductListState {
        loading?: boolean;
        products: any[];
        totalPage?: number;
        page?: number;
        error?: any;
}

interface ProductDetailState {
        loading?: boolean;
        product: { reviews: any[] };
        error?: any;
}

interface ActionType extends Action {
        payload?: any;
        [key: string]: any;
}

interface ProductState {
        loading?: boolean;
        success?: boolean;
        error?: any;
}
//List  of products

export const productListReducers = (state: ProductListState = { products: [] }, action: ActionType): ProductListState => {
        switch (action.type) {
                case productListReq:
                        return { loading: true, products: [] }

                case productListReqSucess:
                        return { loading: false, products: action.payload.data, totalPage: action.payload.totalPage, page: action.payload.page }

                case productListReqFail:
                        return { loading: false, products: [], error: action.payload.error }

                default:
                        return state
        }
}

export const productAddReducer = (state: ProductState = {}, action: ActionType): ProductState => {
        switch (action.type) {
                case productAddReq:
                        return { loading: true };
                case productAddSuccess:
                        return { loading: false, success: true };
                case productAddFail:
                        return { loading: false, error: action.payload };
                default:
                        return state;
        }
};

//Specific product for id

export const productDetailReducers = (state: ProductDetailState = { product: { reviews: [] } }, action: ActionType): ProductDetailState => {
        switch (action.type) {
                case productDetailReq:
                        return { loading: true, ...state }

                case productDetailReqSuccess:
                        return { loading: false, product: action.payload }

                case productDetailReqFail:
                        return { loading: false, product: { reviews: [] }, error: action.payload.error }

                default:
                        return state
        }
}