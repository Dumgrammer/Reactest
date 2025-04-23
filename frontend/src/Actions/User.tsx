import axios from "axios";
import { baseUrl, client_id } from "../Constants/BaseUrl";

// Types
export interface UserInfo {
    data: {
        _id: string;
        name: string;
        email: string;
        isAdmin: boolean;
        token: string;
        createdAt: string;
    };
    success: boolean;
    message: string;
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

interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
}


// Helper function to set auth token
const setAuthToken = (token: string) => {
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common["Authorization"];
    }
};

// Regular login
export const userLogin = async (email: string, password: string): Promise<ApiResponse> => {
    try {
        const { data } = await axios.post(`${baseUrl}/api/users/login`, { email, password });

        if (data.success) {
            // Only store user info in localStorage if user is verified
            if (data.data && data.data.isVerified !== false) {
                localStorage.setItem('userInfo', JSON.stringify(data));
            }
        }

        return data;
    } catch (error: any) {
        const responseData = error.response?.data;
        return {
            success: false,
            message: responseData?.message || 'An error occurred during login',
            data: responseData // Include additional data like email and isVerified
        };
    }
};

// Google OAuth login
// export const googleLogin = async (googleData: any): Promise<ApiResponse> => {
//     try {
//         const { data } = await axios.post(`${baseUrl}/google-login`, {
//             token: googleData.credential,
//             email: googleData.email,
//             name: googleData.name,
//             googleId: googleData.sub || googleData.id
//         });
        
//         if (data.success) {
//             localStorage.setItem('userInfo', JSON.stringify(data));
//         }
        
//         return data;
//     } catch (error: any) {
//         return {
//             success: false,
//             message: error.response?.data?.message || 'An error occurred during Google login'
//         };
//     }
// };

// User registration
export const userRegistration = async (userData: any, navigate: any): Promise<ApiResponse> => {
    try {
        const { data } = await axios.post(`${baseUrl}/api/users/register`, userData);

        if (data.success) {
            // Always redirect to verification page after successful registration
            return {
                success: true,
                message: data.message,
                data: { 
                    email: userData.email,
                    verificationRequired: true
                }
            };
        }

        return data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Registration failed'
        };
    }
};

// Email verification
export const verifyEmail = async (email: string, verificationCode: string): Promise<ApiResponse> => {
    try {
        const { data } = await axios.post(`${baseUrl}/api/users/verify-email`, { email, verificationCode });
        return data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Email verification failed'
        };
    }
};

// Logout functionality
export const userLogout = (): void => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem("cartItems");
    setAuthToken("");
    window.location.href = '/login';
};

// Get user profile
export const getUserProfile = async (): Promise<ApiResponse> => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.data?.token}`
            }
        };
        
        const { data } = await axios.get(`${baseUrl}/api/users/profile`, config);
        return data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch profile'
        };
    }
};

// Update user profile
export const updateUserProfile = async (userData: any): Promise<ApiResponse> => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.data?.token}`
            }
        };
        
        const { data } = await axios.put(`${baseUrl}/api/users/profile`, userData, config);
        if (data.success) {
            localStorage.setItem('userInfo', JSON.stringify(data));
        }
        return data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update profile'
        };
    }
};

// export const userRegistration = async (registrationData: RegistrationData): Promise<AuthResponse> => {
//     try {
//         const config = {
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         };

//         const { data } = await axios.post<RegistrationResponse>(
//             `${baseUrl}/api/users/register`,
//             registrationData,
//             config
//         );

//         // Only proceed if registration was successful
//         if (data.message) {
//             return {
//                 success: true,
//                 message: data.message,
//                 data: {
//                     email: registrationData.email,
//                     verificationRequired: true
//                 }
//             };
//         }

//         return {
//             success: false,
//             message: "Registration failed. Please try again."
//         };
//     } catch (error: any) {
//         return {
//             success: false,
//             message: error.response?.data?.message || "Registration failed. Please try again."
//         };
//     }
// };

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
