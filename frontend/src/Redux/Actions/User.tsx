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

export const userLogin = (email: string, password: string) => async (dispatch: any) => {
    try {
        dispatch({ type: userLoginReq });

        const config = {
            headers: {
                "Content-Type": "application/json",
            }
        }

        const { data } = await axios.post(`${baseUrl}/api/users/login`, { email, password }, config);
        
        dispatch({ type: userLoginReqSuccess, payload: data });
        localStorage.setItem("userInfo", JSON.stringify(data));
        document.location.href = "/";

    } catch (error: any) {
        dispatch({
            type: userLoginReqFail,
            payload: error.response.data.message
        });

        dispatch({ type: userLoginReq })
    }
}

//User logout
export const userLogoutAction = () => async (dispatch: any) => {
    localStorage.removeItem("userInfo");
    dispatch({ type: userLogout });
    document.location.href = "/login";
}

export const userRegistration = (firstname: string | null,
    middlename: string | null,
    lastname: string | null,
    email: string | null,
    password: string | null,
    confirmationpass: string | null) => async (dispatch: any) => {
        try {
            dispatch({ type: userLoginReq });

            const config = {
                headers: {
                    "Content-Type": "application/json",
                }
            }

            const { data } = await axios.post(`${baseUrl}/api/users/register`, { firstname, middlename, lastname, email, password, confirmationpass });

            dispatch({ type: userRegistrationReqSuccess, payload: data });
            dispatch({ type: userLoginReqSuccess, payload: data });
            localStorage.setItem("userInfo", JSON.stringify(data));

        } catch (error: any) {
            dispatch({
                type: userLoginReqFail,
                payload: error.response.data.message
            })
        }
    }