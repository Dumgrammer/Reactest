import { useState, useEffect } from "react";
import Success from "./modals/Success";
import Failed from "./modals/Failed";

interface CartItem {
    _id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    size: string;
    type: string;
}

interface CartItemsProps {
    cartItems: CartItem[];
    onRemoveItem: (itemId: string, size: string, type: string) => void;
}

const CartItems: React.FC<CartItemsProps> = ({ cartItems, onRemoveItem }) => {
    const [cart, setCart] = useState<CartItem[]>(cartItems);
    // Success Modal
    const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);
    // Failed Modal
    const [isFailedOpen, setIsFailedOpen] = useState<boolean>(false);

    // Update cart when localStorage changes
    useEffect(() => {
        const handleCartUpdate = () => {
            const storedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
            setCart(storedCart);
        };

        // Initial load
        handleCartUpdate();

        // Listen for cart updates
        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, []);

    // Sync with props
    useEffect(() => {
        setCart(cartItems);
    }, [cartItems]);

    const handleRemove = (index: number) => {
        try {
            const itemToRemove = cart[index];
            console.log('Removing item at index:', index, {
                size: itemToRemove.size,
                type: itemToRemove.type,
                name: itemToRemove.name
            }); // Debug log
            
            // Create a new array without the item at the specified index
            const updatedCart = [...cart];
            updatedCart.splice(index, 1);
            
            // Update localStorage
            localStorage.setItem("cartItems", JSON.stringify(updatedCart));
            
            // Update state
            setCart(updatedCart);
            
            // Notify parent
            onRemoveItem(itemToRemove._id, itemToRemove.size, itemToRemove.type);
            
            // Show success message
            setIsSuccessOpen(true);
            
            // Dispatch event to notify other components
            window.dispatchEvent(new Event('cartUpdated'));
            
        } catch (error) {
            console.error('Error removing item:', error);
            setIsFailedOpen(true);
        }
    };

    const handleQuantityChange = (index: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        
        const updatedCart = [...cart];
        updatedCart[index].quantity = newQuantity;
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        setCart(updatedCart);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('cartUpdated'));
    };

    return (
        <div className="mt-8">
            <div className="flow-root">
                <ul role="list" className="-my-6 divide-y divide-gray-200">
                    {cart.length > 0 ? (
                        cart.map((item, index) => (
                            <li key={`${item._id}-${item.size}-${item.type}`} className="flex py-6">
                                <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img alt={item.name} src={item.image} className="size-full object-cover" />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                        <div className="item-det-cont flex justify-between text-base font-medium text-gray-900">
                                            <h3>{item.name}</h3>
                                            <p className="ml-4">₱ {item.price * item.quantity}</p>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Size: {item.size} | Type: {item.type}
                                        </p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleQuantityChange(index, item.quantity - 1)}
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
                                            onClick={() => handleRemove(index)}
                                            className="font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            <i className="remove-cart fa fa-trash"></i>
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