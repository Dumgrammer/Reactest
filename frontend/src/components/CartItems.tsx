import { useState, useEffect } from "react";
import Success from "./modals/Success";
import Failed from "./modals/Failed";

interface CartItem {
    _id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartItemsProps {
    cartItems: CartItem[];
    onRemoveItem: (itemId: string) => void;
}

const CartItems: React.FC<CartItemsProps> = ({ cartItems, onRemoveItem }) => {
    const [cart, setCart] = useState<CartItem[]>(cartItems);
    // Success Modal
    const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);
    // Failed Modal
    const [isFailedOpen, setIsFailedOpen] = useState<boolean>(false);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        setCart(storedCart);
    }, []);

    const updateCart = (updatedCart: CartItem[]) => {
        setCart(updatedCart);
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    };

    const removeFromCart = (id: string) => {
        const updatedCart = cart.filter((item) => item._id !== id);
        setCart(updatedCart);
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    };

    const changeQuantity = (id: string, amount: number) => {
        const updatedCart = cart.map((item) =>
            item._id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
        );
        updateCart(updatedCart);
    };

    const handleQuantityChange = (index: number, newQuantity: number) => {
        const updatedCart = [...cart];
        updatedCart[index].quantity = newQuantity;
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('cartUpdated'));
    };

    return (
        <div className="mt-8">
            <div className="flow-root">
                <ul role="list" className="-my-6 divide-y divide-gray-200">
                    {cart.length > 0 ? (
                        cart.map((item, index) => (
                            <li key={item._id} className="flex py-6">
                                <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img alt={item.name} src={item.image} className="size-full object-cover" />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <h3>{item.name}</h3>
                                            <p className="ml-4">₱ {item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleQuantityChange(index, Math.max(0, item.quantity - 1))}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                -
                                            </button>
                                            <span className="text-gray-500">Qty {item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updatedCart = cart.filter((_, i) => i !== index);
                                                localStorage.setItem("cartItems", JSON.stringify(updatedCart));
                                                window.dispatchEvent(new Event('cartUpdated'));
                                                setIsSuccessOpen(true);
                                            }}
                                            className="font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-500">Your cart is empty.</p>
                    )}
                </ul>
            </div>


            {/* Success Modal for Add to Cart */}
            <Success
                isOpen={isSuccessOpen}
                gif={
                <>
                <img className='mx-auto w-1/3 saturate-200' src="/success.gif"/>
                </>
                }
                title="Item Removed" 
                message="Product has been removed from your cart"
                buttonText="Got it, thanks!"
                onConfirm={() => setIsSuccessOpen(false)}
            />

            {/* Failed Modal*/}
            {/* not yet used */}
            <Failed
                isOpen={isFailedOpen} 
                title="Oops!" 
                message="There was an issue processing your request. Please try again"
                buttonText="OK"
                onConfirm={() => setIsFailedOpen(false)}
            />
        </div>
    );
};

export default CartItems;