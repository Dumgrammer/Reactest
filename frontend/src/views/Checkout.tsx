import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import CartItems from '../components/CartItems';
import { useState, useEffect } from 'react';

interface CheckOutProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CheckOut({ open, setOpen }: CheckOutProps) {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) {
            setOpen(false);
            navigate('/login');
            return;
        }

        updateCartAndTotal();

        const handleCartUpdate = () => {
            updateCartAndTotal();
        };
        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [navigate, setOpen]);

    const updateCartAndTotal = () => {
        const storedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        setCartItems(storedCart);
        const newTotal = storedCart.reduce((acc: any, item: any) => acc + (item.price * item.quantity || 0), 0);
        setTotal(newTotal);
    };

    const handleRemoveItem = (itemId: string) => {
        const updatedCart = cartItems.filter((item: any) => item._id !== itemId);
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleCheckout = () => {
        setShowConfirmModal(true);
    };

    const confirmCheckout = () => {
        setShowConfirmModal(false);
        setOpen(false);
        navigate('/payment');
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out" />

            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <DialogPanel className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out">
                            <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                    <div className="flex items-start justify-between">
                                        <DialogTitle className="text-lg font-medium text-gray-900">Your cart</DialogTitle>
                                        <div className="ml-3 flex h-7 items-center">
                                            <button
                                                type="button"
                                                onClick={() => setOpen(false)}
                                                className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                                            >
                                                <span className="sr-only">Close panel</span>
                                                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <CartItems cartItems={cartItems} onRemoveItem={handleRemoveItem} />
                                </div>

                                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <p>Subtotal</p>
                                        <p>${total.toFixed(2)}</p>
                                    </div>
                                    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                                    <div className="mt-6">
                                        <button
                                            onClick={handleCheckout}
                                            disabled={cartItems.length === 0}
                                            className={`w-full flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium shadow-xs transition-colors duration-200 ${
                                                cartItems.length === 0
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-green-500 text-white hover:bg-green-600'
                                            }`}
                                        >
                                            Checkout
                                        </button>
                                    </div>
                                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                                        <p>
                                            or{' '}
                                            <button
                                                type="button"
                                                onClick={() => setOpen(false)}
                                                className="font-medium text-green-600 hover:text-green-500"
                                            >
                                                Continue Shopping
                                                <span aria-hidden="true"> &rarr;</span>
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <Dialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center">
                        <DialogPanel className="bg-white rounded-lg shadow-lg p-6 w-96">
                            <DialogTitle className="text-lg font-bold text-gray-900">Confirm Checkout</DialogTitle>
                            <p className="mt-2 text-gray-600">Are you sure you want to proceed to checkout?</p>
                            <div className="mt-4 flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmCheckout}
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                    Confirm
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </Dialog>
    );
}