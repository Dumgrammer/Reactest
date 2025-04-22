import axios from "axios";
import { baseUrl } from "../Constants/BaseUrl";

// Types
export interface UserInfo {
    data: {
        _id: string;
        name: string;
        email: string;
        isAdmin: boolean;
        token: string;
        createdAt: string;
    }
}

export interface RegistrationResponse {
    message: string;
    data?: {
        email: string;
        verificationRequired: boolean;
    };
}

export interface AuthResponse {
    success: boolean;
    data?: UserInfo | { email: string; verificationRequired: boolean };
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

export interface VerificationResponse {
    success: boolean;
    message?: string;
}

export interface UserProfile {
    _id: string;
    firstname: string;
    middlename: string;
    lastname: string;
    email: string;
    address: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    isAdmin: boolean;
    createdAt: string;
}

export interface ProfileUpdateData {
    firstname?: string;
    middlename?: string;
    lastname?: string;
    email?: string;
    address?: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    password?: string;
    oldPassword?: string;
}

export interface ProfileResponse {
    success: boolean;
    data?: UserProfile;
    message?: string;
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
        setAuthToken(data.data.token);

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
    localStorage.removeItem("cartItems");
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

        const { data } = await axios.post<RegistrationResponse>(
            `${baseUrl}/api/users/register`,
            registrationData,
            config
        );

        // Only proceed if registration was successful
        if (data.message) {
            return {
                success: true,
                message: data.message,
                data: {
                    email: registrationData.email,
                    verificationRequired: true
                }
            };
        }

        return {
            success: false,
            message: "Registration failed. Please try again."
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || "Registration failed. Please try again."
        };
    }
};

export const verifyEmail = async (email: string, verificationCode: string): Promise<VerificationResponse> => {
    try {
        const { data } = await axios.post(`${baseUrl}/api/users/verify-email`, {
            email,
            verificationCode
        });
        return { success: true, message: data.message };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || "Verification failed"
        };
    }
};

export const resendVerificationCode = async (email: string): Promise<VerificationResponse> => {
    try {
        const { data } = await axios.post(`${baseUrl}/api/users/resend-verification`, {
            email
        });
        return { success: true, message: data.message };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to resend verification code"
        };
    }
};

// Initialize auth token from localStorage on app start
const userInfo = localStorage.getItem("userInfo");
if (userInfo) {
    const parsedUser = JSON.parse(userInfo) as UserInfo;
    setAuthToken(parsedUser.data.token);
}

export const getUserProfile = async (): Promise<ProfileResponse> => {
    try {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) {
            return {
                success: false,
                message: "User not logged in"
            };
        }

        const parsedUser = JSON.parse(userInfo) as UserInfo;
        const config = {
            headers: {
                Authorization: `Bearer ${parsedUser.data.token}`
            }
        };

        const { data } = await axios.get(`${baseUrl}/api/users/profile`, config);
        return { success: true, data: data.data };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch profile"
        };
    }
};

export const updateUserProfile = async (profileData: ProfileUpdateData): Promise<ProfileResponse> => {
    try {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) {
            return {
                success: false,
                message: "User not logged in"
            };
        }

        const parsedUser = JSON.parse(userInfo) as UserInfo;
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${parsedUser.data.token}`
            }
        };

        const { data } = await axios.put(
            `${baseUrl}/api/users/profile`,
            profileData,
            config
        );

        // Update the stored user info with the new data
        const updatedUserInfo = {
            ...JSON.parse(userInfo),
            data: {
                ...JSON.parse(userInfo).data,
                name: `${data.data.firstname} ${data.data.middlename} ${data.data.lastname}`,
                email: data.data.email
            }
        };

        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        
        // Trigger storage event to notify components
        window.dispatchEvent(new Event("storage"));

        return { success: true, data: data.data, message: data.message };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || "Failed to update profile"
        };
    }
};
