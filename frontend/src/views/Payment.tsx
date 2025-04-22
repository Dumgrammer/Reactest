import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout/Layouts";
import { baseUrl } from "../Constants/BaseUrl";
import { createOrder, createCashOnPickupOrder, createGcashOrder } from "../Actions/Order";
import { getUserProfile, UserProfile } from "../Actions/User";

interface CartItem {
    _id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

export default function Payment() {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [total, setTotal] = useState(0);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        setCart(storedCart);
        // Calculate total
        const total = storedCart.reduce((acc: number, item: CartItem) => 
            acc + (item.price * item.quantity), 0
        );
        setTotal(total);
        
        // Fetch user profile for address
        fetchUserProfile();
    }, []);
    
    const fetchUserProfile = async () => {
        const response = await getUserProfile();
        if (response.success && response.data) {
            setProfile(response.data);
        }
    };

    const handleGcashPayment = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await createGcashOrder(cart, total);
            
            if (!response.success) {
                throw new Error(response.message);
            }

            // Redirect to GCash checkout
            window.location.href = response.checkoutUrl;

        } catch (err: any) {
            setError(err.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    const handleCashOnPickup = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await createCashOnPickupOrder(cart, total);
            
            if (!response.success) {
                throw new Error(response.message);
            }

            // Clear cart and redirect to success page
            localStorage.removeItem("cartItems");
            navigate("/payment/success");

        } catch (err: any) {
            console.error('Order error:', err);
            setError(err.message || "Order creation failed");
        } finally {
            setLoading(false);
        }
    };

    const addressIsComplete = profile?.address?.street && 
                              profile?.address?.city && 
                              profile?.address?.postalCode;

    return (
        <Layout>
            <div className="py-14 px-4 md:px-6 2xl:px-20 2xl:container 2xl:mx-auto">
                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                {!addressIsComplete && (
                    <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Warning: </strong>
                        <span className="block sm:inline">
                            Your address information is incomplete. Please 
                            <a href="/profile" className="text-blue-600 underline ml-1">update your profile</a> 
                            with your complete address before checkout.
                        </span>
                    </div>
                )}
                
                <div className="flex justify-start item-start space-y-2 flex-col">
                    <h1 className="text-3xl dark:text-white lg:text-4xl font-semibold leading-7 lg:leading-9 text-gray-800">Checkout</h1>
                    <p className="text-base dark:text-gray-300 font-medium leading-6 text-gray-600">
                        {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                <div className="mt-10 flex flex-col xl:flex-row jusitfy-center items-stretch w-full xl:space-x-8 space-y-4 md:space-y-6 xl:space-y-0">
                    <div className="flex flex-col justify-start items-start w-full space-y-4 md:space-y-6 xl:space-y-8">
                        <div className="flex flex-col justify-start items-start dark:bg-gray-800 bg-gray-50 px-4 py-4 md:py-6 md:p-6 xl:p-8 w-full">
                            <p className="text-lg md:text-xl dark:text-white font-semibold leading-6 xl:leading-5 text-gray-800">Your Cart</p>
                            <div className="mt-4 md:mt-6 flex flex-col justify-start items-start w-full">
                                {cart.length > 0 ? (
                                    cart.map((item, index) => (
                                        <div key={index} className="p-4 md:p-8 w-full bg-white flex flex-row gap-4 border-b border-gray-200">
                                            <div className="flex flex-col">
                                                <img className="m-auto h-[10vmin] hidden md:block " src={item.image} alt={item.name} />
                                                <img className="m-auto h-[10vmin] md:hidden" src={item.image} alt={item.name} />
                                            </div>
                                            <div className="flex flex-col justify-start items-start w-full">
                                                <div className="w-full flex flex-col justify-start items-start space-y-4">
                                                    <h3 className="dark:text-white text-md sm:text-sm font-semibold leading-6 text-[#0A9659]">{item.name}</h3>
                                                    <div className="flex justify-start items-start flex-col space-y-2">
                                                        <p className="text-sm dark:text-white leading-none text-gray-800">
                                                            <span className="dark:text-gray-400 text-gray-300">Quantity: </span> {item.quantity}
                                                        </p>
                                                        <p className="text-sm dark:text-white leading-none text-gray-800">
                                                            <span className="dark:text-gray-400 text-gray-300">Price: </span> ₱{item.price}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-lg dark:text-white text-gray-800">Your cart is empty.</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Shipping Address */}
                        <div className="flex flex-col justify-start items-start dark:bg-gray-800 bg-gray-50 px-4 py-4 md:py-6 md:p-6 xl:p-8 w-full">
                            <p className="text-lg md:text-xl dark:text-white font-semibold leading-6 xl:leading-5 text-gray-800">Shipping Address</p>
                            {profile ? (
                                <div className="mt-4 flex flex-col">
                                    <p className="text-base dark:text-white font-semibold leading-4 text-left text-gray-800">
                                        {profile.firstname} {profile.middlename} {profile.lastname}
                                    </p>
                                    <p className="text-sm dark:text-gray-300 leading-5 text-gray-600 mt-2">
                                        {profile.address?.street || "No street address provided"}
                                    </p>
                                    <p className="text-sm dark:text-gray-300 leading-5 text-gray-600">
                                        {profile.address?.city || "No city provided"}{profile.address?.postalCode ? `, ${profile.address.postalCode}` : ""}
                                    </p>
                                    <p className="text-sm dark:text-gray-300 leading-5 text-gray-600">
                                        {profile.address?.country || "Philippines"}
                                    </p>
                                    <a 
                                        href="/profile" 
                                        className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                                    >
                                        Edit address
                                    </a>
                                </div>
                            ) : (
                                <p className="mt-4 text-base dark:text-white text-gray-800">
                                    Loading address information...
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 w-full xl:w-96 flex items-center md:items-start py-2 md:p-2 xl:p-4 flex-col">
                        <div className="flex flex-col px-4 py-6 md:p-6 xl:p-8 w-full bg-white dark:bg-gray-800 space-y-6 xl:mb-4">
                            <h3 className="text-xl dark:text-white font-semibold leading-5 text-gray-800">Order Summary</h3>
                            <div className="flex justify-center items-center w-full space-y-4 flex-col border-gray-200 border-b pb-4">
                                <div className="flex justify-between w-full">
                                    <p className="text-base dark:text-white leading-4 text-gray-800">Subtotal</p>
                                    <p className="text-base dark:text-gray-300 leading-4 text-gray-600">₱{total.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <p className="text-base dark:text-white font-semibold leading-4 text-gray-800">Total</p>
                                <p className="text-base dark:text-gray-300 font-semibold leading-4 text-gray-600">₱{total.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center px-4 py-6 md:p-6 xl:p-8 w-full bg-white dark:bg-gray-800 space-y-6">
                            <h3 className="text-xl dark:text-white font-semibold leading-5 text-gray-800">Payment</h3>
                            <div className="flex flex-row xl:flex-col justify-between items-start xl:items-end w-full">
                                <div className="flex justify-center items-center space-x-4">
                                    <div className="w-8 h-8">
                                        <img className="w-full h-full" alt="logo" src="/Campus_Cart.png" />
                                    </div>
                                    <div className="flex flex-col justify-start items-center">
                                        <p className="text-lg leading-6 dark:text-white font-semibold text-gray-800">
                                            Arrival of Orders<br />
                                            <span className="font-normal">Delivery within 3 months</span>
                                        </p>
                                    </div>
                                </div>
                                <p className="xl:mt-4 text-lg font-semibold leading-6 dark:text-white text-[#0A9659]">₱{total.toFixed(2)}</p>
                            </div>
                            <div className="w-full flex xl:flex-col gap-2 justify-center items-center">
                                <button 
                                    onClick={handleGcashPayment}
                                    disabled={loading || cart.length === 0 || !addressIsComplete}
                                    className="hover:bg-[#0CA562] dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 py-3 rounded-sm w-96 md:w-full bg-[#0A9659] text-base font-medium leading-4 text-white disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Pay with GCash'}
                                </button>
                                <button 
                                    onClick={handleCashOnPickup}
                                    disabled={loading || cart.length === 0 || !addressIsComplete}
                                    className="hover:bg-[#0CA562] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 py-3 rounded-sm w-96 md:w-full bg-[#0A9659] text-base font-medium leading-4 text-white disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Cash on Pickup'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}