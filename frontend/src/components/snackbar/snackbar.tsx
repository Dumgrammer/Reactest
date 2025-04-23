import React, { useEffect } from 'react';

interface SnackbarProps {
    open: boolean;
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ open, message, type, onClose }) => {
    useEffect(() => {
        if (open) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [open, onClose]);

    if (!open) return null;

    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[250px]`}>
                <span>{message}</span>
                <button
                    onClick={onClose}
                    className="ml-4 text-white hover:text-gray-200 focus:outline-none"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Snackbar;
