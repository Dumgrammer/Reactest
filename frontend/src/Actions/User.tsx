import axios from "axios";
import { baseUrl } from "../Constants/BaseUrl";

export const userLogin = async (email: string, password: string) => {
    try {
        const config = {
            headers: { "Content-Type": "application/json" }
        };

        const { data } = await axios.post(`${baseUrl}/api/users/login`, { email, password }, config);

        localStorage.setItem("userInfo", JSON.stringify(data));
        return { success: true, data };

    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || "Login failed" };
    }
};


//User logout
export const userLogoutAction = () => {
    localStorage.removeItem("userInfo");
    window.dispatchEvent(new Event("storage"));
    document.location.href = "/login";
  };
  

export const userRegistration = async (
    firstname: string | null,
    middlename: string | null,
    lastname: string | null,
    email: string | null,
    password: string | null,
    confirmationpass: string | null
) => {
    try {
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };

        const { data } = await axios.post(`${baseUrl}/api/users/register`, {
            firstname,
            middlename,
            lastname,
            email,
            password,
            confirmationpass,
        }, config);

        localStorage.setItem("userInfo", JSON.stringify(data));

        return data;
    } catch (error: any) {
        console.error("Registration failed:", error);
        throw error;
    }
};
