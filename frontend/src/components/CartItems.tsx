import { useState, useEffect } from "react";

interface CartItem {
    _id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartItemsProps {
    cartItems: CartItem[];
}

export default function CartItems({ cartItems }: CartItemsProps) {
    const [cart, setCart] = useState<CartItem[]>(cartItems);

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

    return (
        <div className="mt-8">
            <div className="flow-root">
                <ul role="list" className="-my-6 divide-y divide-gray-200">
                    {cart.length > 0 ? (
                        cart.map((item) => (
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
                                                onClick={() => changeQuantity(item._id, -1)}
                                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md"
                                            >
                                                −
                                            </button>
                                            <p className="text-gray-500">Qty: {item.quantity}</p>
                                            <button
                                                onClick={() => changeQuantity(item._id, 1)}
                                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item._id)}
                                            className="font-medium text-red-600 hover:text-red-500"
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
        </div>
    );
}