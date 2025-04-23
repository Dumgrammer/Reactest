import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../Layout/Layouts";
import { userRegistration, RegistrationData, UserInfo } from "../../Actions/User";
import Snackbar from "../../components/snackbar/snackbar";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegistrationData>({
        firstname: '',
        middlename: '',
        lastname: '',
        email: '',
        password: '',
        confirmationpass: ''
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

    // Check for existing login on component mount
    useEffect(() => {
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) {
            try {
                const userInfo = JSON.parse(storedUser) as UserInfo;
                if (userInfo.data.token) {
                    navigate("/");
                }
            } catch (error) {
                localStorage.removeItem("userInfo");
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
        const { firstname, middlename, lastname, email, password, confirmationpass } = formData;

        // Check for numbers in names
        const nameRegex = /^[a-zA-Z]+$/;
        if (!nameRegex.test(firstname) || !nameRegex.test(middlename) || !nameRegex.test(lastname)) {
            setSnackbar({ open: true, message: "Names cannot contain numbers.", type: "error" });
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setSnackbar({ open: true, message: "Invalid email address.", type: "error" });
            return false;
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        if (!passwordRegex.test(password)) {
            setSnackbar({
                open: true,
                message: "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.",
                type: "error"
            });
            return false;
        }

        // Check if passwords match
        if (password !== confirmationpass) {
            setSnackbar({ open: true, message: "Passwords do not match.", type: "error" });
            return false;
        }

        return true;
    };

    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateInputs()) return;

        setLoading(true);

        try {
            const response = await userRegistration(formData);
            if (!response.success) {
                setSnackbar({ open: true, message: response.message || "Registration failed.", type: "error" });
                return;
            }

            // Check if verification is required
            if (response.data && 'verificationRequired' in response.data) {
                navigate("/verify-code", {
                    state: {
                        email: formData.email,
                        message: response.message
                    }
                });
                setSnackbar({ open: true, message: "Registration successful! Please verify your email.", type: "success" });
            } else {
                setSnackbar({ open: true, message: "Registration completed but verification status is unknown.", type: "error" });
            }
        } catch (err) {
            setSnackbar({ open: true, message: "Failed to register user. Please try again.", type: "error" });
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
            {loading ? (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <div className="mid-flex">
                    <form className="max-w-md mx-auto flex flex-col items-center" onSubmit={submitForm}>
                        <div className="h1">Registration</div>
                        <div className="grid md:grid-cols-3 md:gap-4 w-full">
                            <div className="relative z-0 w-full mb-5 group">
                                <input
                                    type="text"
                                    name="firstname"
                                    id="floating_first_name"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                    placeholder=" "
                                    required
                                    value={formData.firstname}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="floating_first_name">First name</label>
                            </div>
                            <div className="relative z-0 w-full mb-5 group">
                                <input
                                    type="text"
                                    name="middlename"
                                    id="floating_middle_name"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                    placeholder=" "
                                    value={formData.middlename}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="floating_middle_name">Middle name</label>
                            </div>
                            <div className="relative z-0 w-full mb-5 group">
                                <input
                                    type="text"
                                    name="lastname"
                                    id="floating_last_name"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                    placeholder=" "
                                    required
                                    value={formData.lastname}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="floating_last_name">Last name</label>
                            </div>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="email"
                                name="email"
                                id="floating_email"
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                placeholder=" "
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="floating_email">Email address</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="password"
                                name="password"
                                id="floating_password"
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                placeholder=" "
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="floating_password">Password</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="password"
                                name="confirmationpass"
                                id="floating_repeat_password"
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300"
                                placeholder=" "
                                required
                                value={formData.confirmationpass}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="floating_repeat_password">Confirm password</label>
                        </div>

                        <button 
                            type="submit" 
                            className="p-btn focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Submit'}
                        </button>
                    </form>
                </div>
            )}
        </Layout>
    );
}