import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../Layout/Layouts";
import { userLogin } from "../../Actions/User";
import Snackbar from "../../components/snackbar/snackbar";
import '../../styles.css';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

    // Check for existing login on component mount
    useEffect(() => {
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) {
            try {
                const userInfo = JSON.parse(storedUser);
                if (userInfo.data?.token) {
                    navigate("/");
                } else {
                    localStorage.removeItem("userInfo");
                }
            } catch (error) {
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

    const validateInputs = (): boolean => {
        const { email, password } = formData;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setSnackbar({ open: true, message: "Invalid email address.", type: "error" });
            return false;
        }

        // Check if password is empty
        if (!password) {
            setSnackbar({ open: true, message: "Password cannot be empty.", type: "error" });
            return false;
        }

        return true;
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateInputs()) return;

        setLoading(true);

        try {
            const response = await userLogin(formData.email, formData.password);
            if (response.success && response.data) {
                window.dispatchEvent(new Event("storage"));
                const userData = (response.data as any).data;

                setSnackbar({ open: true, message: "Login successful!", type: "success" });

                if (userData.isAdmin) {
                    setTimeout(() => (window.location.href = "/admin"), 1000);
                } else {
                    setTimeout(() => (window.location.href = "/"), 1000);
                }
            } else {
                setSnackbar({ open: true, message: response.message || "Wrong username or password.", type: "error" });
            }
        } catch (err) {
            setSnackbar({ open: true, message: "An error occurred during login.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Layout>
            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type as "success" | "error"}
                onClose={handleCloseSnackbar}
            />
            <div>
                {loading ? (
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
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
                                            className="oauth-button"
                                        >
                                            <img src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" alt="Google Logo" />
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