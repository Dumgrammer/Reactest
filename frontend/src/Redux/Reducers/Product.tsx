import { Action } from "redux";
import { 

    productListReq,
    productListReqSucess,
    productListReqFail,

    productDetailReq,
    productDetailReqSuccess,
    productDetailReqFail

 }  from "../Constants/Product";

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

interface ActionType extends Action{
        payload?: any;
        [key: string]: any;
}

//List  of products

 export const productListReducers  = (state: ProductListState = { products: [] }, action: ActionType): ProductListState => {
    switch (action.type) {
        case productListReq:
                return { loading : true, products: [] }

        case productListReqSucess:
                return { loading: false, products: action.payload.data, totalPage: action.payload.totalPage, page: action.payload.page }
        
        case productListReqFail:
                return  { loading: false, products: [], error:  action.payload.error }

        default:
                return state
        }
}

 //Specific product for id

 export const productDetailReducers  = (state: ProductDetailState = { product: { reviews: [] } }, action: ActionType): ProductDetailState => {
        switch (action.type) {
            case productDetailReq:
                    return { loading : true, ...state }
    
            case productDetailReqSuccess:
                    return { loading: false, product: action.payload }
            
            case productDetailReqFail:
                    return  { loading: false, product: { reviews: [] }, error: action.payload.error }
    
            default:
                    return state
        }
}