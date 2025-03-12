import axios from "axios";
import { baseUrl } from "../Constants/BaseUrl";

// Types
export interface UserInfo {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    token: string;
    createdAt: string;
}

export interface AuthResponse {
    success: boolean;
    data?: UserInfo;
    message?: string;
}

export interface RegistrationData {
    firstname: string;
    middlename: string;
    lastname: string;
    email: string;
    password: string;
    confirmationpass: string;
}

// Helper function to set auth token
const setAuthToken = (token: string) => {
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common["Authorization"];
    }
};

export const userLogin = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const config = {
            headers: { "Content-Type": "application/json" }
        };

        const { data } = await axios.post<UserInfo>(`${baseUrl}/api/users/login`, { email, password }, config);
        
        // Store user info in localStorage
        localStorage.setItem("userInfo", JSON.stringify(data));
        
        // Set auth token for subsequent requests
        setAuthToken(data.token);

        return { success: true, data };

    } catch (error: any) {
        return { 
            success: false, 
            message: error.response?.data?.message || "Login failed" 
        };
    }
};

//User logout
export const userLogoutAction = () => {
    // Clear auth data
    localStorage.removeItem("userInfo");
    setAuthToken("");
    
    // Notify components about the logout
    window.dispatchEvent(new Event("storage"));
    
    // Redirect to login
    document.location.href = "/login";
};

export const userRegistration = async (registrationData: RegistrationData): Promise<AuthResponse> => {
    try {
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };

        const { data } = await axios.post<UserInfo>(
            `${baseUrl}/api/users/register`,
            registrationData,
            config
        );

        // Store user info in localStorage
        localStorage.setItem("userInfo", JSON.stringify(data));
        
        // Set auth token for subsequent requests
        setAuthToken(data.token);

        return { success: true, data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || "Registration failed"
        };
    }
};

// Initialize auth token from localStorage on app start
const userInfo = localStorage.getItem("userInfo");
if (userInfo) {
    const parsedUser = JSON.parse(userInfo) as UserInfo;
    setAuthToken(parsedUser.token);
}
