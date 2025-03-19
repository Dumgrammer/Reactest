import React, { useRef } from 'react';
import Layout from "../Layout/Layouts";

export default function VerifyCode() {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;

        // Move to the next box if a value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        } 
        // Move to the previous box if the current input is cleared
        else if (value === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Verification Code</h2>
                    <form>
                        <div className="flex justify-center mb-6">
                            {Array(6).fill("").map((_, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    className="w-12 h-12 text-center text-xl border border-gray-300 rounded mx-1"
                                    onChange={(e) => handleChange(e, index)}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                />
                            ))}
                        </div>
                        <button
                            type="submit"
                            className="bg-[#0A9659] text-white px-6 py-3 rounded-sm hover:bg-[#0CA562] transition-colors duration-200"
                        >
                            Verify Code
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}