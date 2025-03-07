import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../Layout/Layouts";
import { userLogin } from "../../Actions/User";
import '../../styles.css';

export default function Login() {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loginForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const response = await userLogin(email, password);

        setLoading(false);
        if (!response.success) {
            setError(response.message);
        } else {
            window.location.href = "/";
        }
    };

    return (
        <Layout>
            <div>
                {loading ? (
                    <h1>Loading...</h1>
                ) : error ? (
                    <h1>{error}</h1>
                ) : (
                    <section className="bg-gray-50 dark:bg-gray-900">
                        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                            <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                        Sign in to your account
                                    </h1>
                                    <form className="space-y-4 md:space-y-6" onSubmit={loginForm}>
                                        <div>
                                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                            <input type="email" id="email" className="bg-gray-50 border text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com" required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                            <input type="password" id="password" placeholder="••••••••" className="bg-gray-50 border text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" className="w-full p-btn font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600">
                                            Sign in
                                        </button>
                                        <div className="separator-text">or</div>
                                        <button 
                                            type="button" 
                                            // onClick={handleGoogleSignIn} 
                                            className="oauth-button"
                                        >
                                            <img src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" alt="Goggle Logo"/>
                                            Continue with Google
                                        </button>
                                        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                            Don’t have an account yet?
                                            <Link to="/register">
                                                <span className="font-medium text-primary-600 hover:underline dark:text-primary-500"> Sign up</span>
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
