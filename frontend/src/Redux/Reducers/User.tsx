import { Action } from "redux";

import { 
    userLoginReq, 
    userLoginReqSuccess, 
    userLoginReqFail, 
    userLogout,

    userRegistrationReq, 
    userRegistrationReqSuccess, 
    userRegistrationReqFail
 } from "../Constants/User";

interface userLoginState {
    loading?: boolean,
    userInfo?: string[],
    error?: any 
}

interface ActionType extends Action {
        payload?: any,
        [key: string]: any
}


 export const userLoginReducer = (state = {}, action: ActionType): userLoginState => {
    switch (action.type) {
        case userLoginReq:
            return  { loading: true }

        case userLoginReqSuccess:
            return { loading: false, userInfo: action.payload }

        case userLoginReqFail:
            return { loading: false, error: action.payload }
    
        default:
            return state;
    }
 }