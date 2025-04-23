import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../Layout/Layouts";
import { userLogin } from "../../Actions/User";
import '../../styles.css';
import { baseUrl } from "../../Constants/BaseUrl";

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Check for error query parameter
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        
        if (errorParam === 'auth_failed') {
            setError("Authentication failed. Please try again.");
        } else if (errorParam === 'missing_data') {
            setError("Missing authentication data. Please try again.");
        }
    }, []);

    // Check for existing login on component mount
    useEffect(() => {
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) {
            try {
                // Validate stored user data
                const userInfo = JSON.parse(storedUser);
                if (userInfo.data?.token) {
                    navigate("/");
                } else {
                    // Invalid stored data, clear it
                    localStorage.removeItem("userInfo");
                }
            } catch (error) {
                // Invalid JSON in localStorage, clear it
                localStorage.removeItem("userInfo");
                console.error("Invalid stored user data:", error);
            }
        }
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            console.log("Attempting login with:", formData.email);
            const response = await userLogin(formData.email, formData.password);
            console.log("Login response:", response);
            if (response.success && response.data) {
                window.dispatchEvent(new Event("storage"));
                const userData = (response.data as any).data;
                console.log("User data:", userData);
                if (userData.isAdmin) {
                    window.location.href = "/admin";
                } else {
                    window.location.href = "/";
                }
            } else {
                console.error("Login failed:", response.message);
                setError(response.message || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    // Handle Google sign-in button click handle this piece of sh
    const handleGoogleSignIn = () => {
        const googleAuthUrl = `${baseUrl}/api/users/auth/google`;
        console.log('Redirecting to Google auth URL:', googleAuthUrl);
        window.location.href = googleAuthUrl;
    };

    return (
        <Layout>
            <div>
                {loading ? (
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                ) : (
                    <section className="bg-gray-50 dark:bg-gray-900">
                        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                            <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                        Sign in to your account
                                    </h1>
                                    <form className="space-y-4 md:space-y-6" onSubmit={submitForm}>
                                        <div>
                                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                className="bg-gray-50 border text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                placeholder="name@company.com"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                placeholder="••••••••"
                                                className="bg-gray-50 border text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                                required
                                                value={formData.password}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full p-btn font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600"
                                            disabled={loading}
                                        >
                                            {loading ? 'Signing in...' : 'Sign in'}
                                        </button>
                                        <div className="separator-text">or</div>
                                        <button 
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="oauth-button"
                                        >
                                            <img src="/google-icon.png" alt="Google" />
                                            Continue with Google
                                        </button>
                                        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                            Don't have an account yet?{' '}
                                            <Link to="/register">
                                                <span className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</span>
                                            </Link>
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
}
