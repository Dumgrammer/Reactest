import axios from "axios";

import { 
    userLoginReq, 
    userLoginReqSuccess, 
    userLoginReqFail, 
    userLogout,

    userRegistrationReq, 
    userRegistrationReqSuccess, 
    userRegistrationReqFail
 } from "../Constants/User";

 import { baseUrl } from "../Constants/BaseUrl";

 //Login handler

 export const userLogin = (email: string, password: string) => async(dispatch: any) => {
    try {
        dispatch({ type: userLoginReq });

        const config = {
            headers: {
                "Content-Type": "application/json",
            }
        }

        const { data } = await axios.post(`${ baseUrl }/api/users/login`);

        dispatch({ type: userLoginReqSuccess, payload: data });

    } catch (error: any) {
        dispatch({ 
            type: userLoginReqFail, 
            payload: error.response.data.message
        })
    }
 }