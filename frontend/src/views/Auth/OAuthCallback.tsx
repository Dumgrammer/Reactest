import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleOAuthCallback = () => {
            try {
                console.log('OAuth callback component loaded');
                console.log('URL:', window.location.href);
                
                // Get token and user data from URL parameters
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                const userDataString = urlParams.get('userData');
                
                console.log('Token received:', token ? 'Yes' : 'No');
                console.log('UserData received:', userDataString ? 'Yes' : 'No');
                
                if (!token || !userDataString) {
                    console.error('Missing token or user data in OAuth callback');
                    navigate('/login?error=missing_data');
                    return;
                }
                
                // Parse the user data
                const userData = JSON.parse(decodeURIComponent(userDataString));
                console.log('User data parsed successfully');
                
                // Store the user info in localStorage
                localStorage.setItem('userInfo', JSON.stringify({
                    success: true,
                    data: userData,
                    message: "Login successful"
                }));
                
                // Trigger storage event to update other components
                window.dispatchEvent(new Event('storage'));
                console.log('Storage event dispatched');
                
                // Redirect based on user role
                if (userData.isAdmin) {
                    console.log('Redirecting to admin dashboard');
                    navigate('/admin');
                } else {
                    console.log('Redirecting to home page');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error processing OAuth callback:', error);
                navigate('/login?error=auth_failed');
            }
        };

        handleOAuthCallback();
    }, [navigate]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
    );
};

export default OAuthCallback; 