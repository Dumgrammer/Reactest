import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from "../Layout/Layouts";
import { verifyEmail, resendVerificationCode } from '../Actions/User';

export default function VerifyCode() {
    const navigate = useNavigate();
    const location = useLocation();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(''));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(30);

    // Get email from location state
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendDisabled && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setResendDisabled(false);
        }
        return () => clearInterval(timer);
    }, [resendDisabled, countdown]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const code = verificationCode.join('');
        if (code.length !== 6) {
            setError('Please enter the complete verification code');
            setLoading(false);
            return;
        }

        try {
            const response = await verifyEmail(email, code);
            if (response.success) {
                navigate('/login', { state: { message: 'Email verified successfully! Please login.' } });
            } else {
                setError(response.message || 'Verification failed');
            }
        } catch (err) {
            setError('An error occurred during verification');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setResendDisabled(true);
        setCountdown(30);
        setError('');

        try {
            const response = await resendVerificationCode(email);
            if (!response.success) {
                setError(response.message || 'Failed to resend verification code');
            }
        } catch (err) {
            setError('An error occurred while resending the code');
        }
    };

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Verification Code</h2>
                    <p className="text-gray-600 mb-6">
                        We've sent a verification code to {email}
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center mb-6">
                            {verificationCode.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    className="w-12 h-12 text-center text-xl border border-gray-300 rounded mx-1 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                />
                            ))}
                        </div>
                        {error && (
                            <div className="text-red-500 mb-4">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#0A9659] text-white px-6 py-3 rounded-sm hover:bg-[#0CA562] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full mb-4"
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={resendDisabled}
                            className="text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendDisabled 
                                ? `Resend code in ${countdown}s` 
                                : 'Resend verification code'}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}