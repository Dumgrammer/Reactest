import { useNavigate } from "react-router-dom";
import Layout from "../Layout/Layouts";

export default function PaymentSuccess() {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <div className="mb-6">
                        <svg className="mx-auto h-16 w-16 text-[#0A9659]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for your order. Your items will be ready for pickup soon.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-[#0A9659] text-white px-6 py-3 rounded-sm hover:bg-[#0CA562] transition-colors duration-200"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </Layout>
    );
} 