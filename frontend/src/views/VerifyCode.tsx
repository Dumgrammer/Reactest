import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../Layout/Layouts";
import { verifyEmail, resendVerificationCode } from "../Actions/User";

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill(""),
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Get email from location state or localStorage
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // First try to get email from location state
    const stateEmail = location.state?.email;

    // If not in state, try localStorage
    const storedEmail = localStorage.getItem("pendingVerification");

    if (stateEmail) {
      setEmail(stateEmail);
      // Store in localStorage in case of page refresh
      localStorage.setItem("pendingVerification", stateEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email found, redirect to login
      navigate("/login");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, countdown]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Email not found. Please return to login page.");
      setLoading(false);
      return;
    }

    const code = verificationCode.join("");
    if (code.length !== 6) {
      setError("Please enter the complete verification code");
      setLoading(false);
      return;
    }

    try {
      const response = await verifyEmail(email, code);
      if (response.success) {
        // Clear the pending verification from localStorage
        localStorage.removeItem("pendingVerification");

        // Use replace instead of navigate to avoid back button issues
        window.location.href = "/login";
      } else {
        setError(response.message || "Verification failed");
      }
    } catch (err) {
      setError("An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email not found. Please return to login page.");
      return;
    }

    setResendDisabled(true);
    setCountdown(30);
    setError("");

    try {
      const response = await resendVerificationCode(email);
      if (!response.success) {
        setError(response.message || "Failed to resend verification code");
      }
    } catch (err) {
      setError("An error occurred while resending the code");
    }
  };

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center">
        <div className="ver-cont w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Enter Verification Code
          </h2>
          <p className="mb-6 text-gray-600">
            We've sent a verification code to {email}
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex justify-center">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="mx-1 h-12 w-12 rounded border border-gray-300 text-center text-xl focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => (inputRefs.current[index] = el)}
                />
              ))}
            </div>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="mb-4 w-full rounded-sm bg-[#0A9659] px-6 py-3 text-white transition-colors duration-200 hover:bg-[#0CA562] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendDisabled}
              className="text-green-600 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resendDisabled
                ? `Resend code in ${countdown}s`
                : "Resend verification code"}
            </button>
            <div className="mt-4">
              <a href="/login" className="text-blue-600 hover:text-blue-800">
                Back to login
              </a>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
