import { useEffect, useState } from "react";
import Layout from "../Layout/Layouts";

interface CartItem {
    _id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
}


export default function Payment() {

    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        setCart(storedCart);
    }, []);

    return (

        <Layout>
            <div className="py-14 px-4 md:px-6 2xl:px-20 2xl:container 2xl:mx-auto">
                <div className="flex justify-start item-start space-y-2 flex-col">
                    <h1 className="text-3xl dark:text-white lg:text-4xl font-semibold leading-7 lg:leading-9 text-gray-800">Test</h1>
                    <p className="text-base dark:text-gray-300 font-medium leading-6 text-gray-600">March 7, 2025 5:56pm</p>
                </div>
                <div className="mt-10 flex flex-col xl:flex-row jusitfy-center items-stretch w-full xl:space-x-8 space-y-4 md:space-y-6 xl:space-y-0">
                    <div className="flex flex-col justify-start items-start w-full space-y-4 md:space-y-6 xl:space-y-8">
                        <div className="flex flex-col justify-start items-start dark:bg-gray-800 bg-gray-50 px-4 py-4 md:py-6 md:p-6 xl:p-8 w-full">
                            <p className="text-lg md:text-xl dark:text-white font-semibold leading-6 xl:leading-5 text-gray-800">Your Cart</p>
                            <div className="mt-4 md:mt-6 flex flex-col justify-start items-start w-full">
                                {cart.length > 0 ? (
                                    cart.map((item, index) => (
                                        <div key={index} className="p-4 md:p-8 w-full bg-white flex flex-row gap-4 border-b border-gray-200">
                                            {/* Image block */}
                                            <div className="flex flex-col">
                                                <img className="m-auto h-[10vmin] hidden md:block " src={item.image} alt="dress" />
                                                <img className="m-auto h-[10vmin] md:hidden" src={item.image} alt="dress" />
                                            </div>

                                            {/* Content block */}
                                            <div className=" flex flex-col justify-start items-start w-full">
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

                                                {/* <div className="flex justify-between space-x-8 items-start w-full mt-auto">
                                                    <p className="text-base dark:text-white xl:text-sm leading-6">$36.00</p>
                                                    <p className="text-base dark:text-white xl:text-sm leading-6 text-gray-800">01</p>
                                                    <p className="text-base dark:text-white xl:text-sm font-semibold leading-6 text-gray-800">₱3000</p>
                                                </div> */}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-lg dark:text-white text-gray-800">Your cart is empty.</p>
                                )}
                            </div>



                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 w-full xl:w-96 flex items-center md:items-start py-2 md:p-2 xl:p-4 flex-col">
                        {/* Summary */}
                        <div className="flex flex-col px-4 py-6 md:p-6 xl:p-8 w-full bg-white dark:bg-gray-800 space-y-6 xl:mb-4">
                                <h3 className="text-xl dark:text-white font-semibold leading-5 text-gray-800">Order Summary</h3>
                                <div className="flex justify-center items-center w-full space-y-4 flex-col border-gray-200 border-b pb-4">
                                    <div className="flex justify-between w-full">
                                        <p className="text-base dark:text-white leading-4 text-gray-800">Subtotal</p>
                                        <p className="text-base dark:text-gray-300 leading-4 text-gray-600">₱3000.00</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-base dark:text-white font-semibold leading-4 text-gray-800">Total</p>
                                    <p className="text-base dark:text-gray-300 font-semibold leading-4 text-gray-600">₱3000</p>
                                </div>
                            </div>
                            {/* Payment */}
                            <div className="flex flex-col justify-center px-4 py-6 md:p-6 xl:p-8 w-full bg-white dark:bg-gray-800 space-y-6">
                                <h3 className="text-xl dark:text-white font-semibold leading-5 text-gray-800">Payment</h3>
                                <div className="flex flex-row xl:flex-col justify-between items-start xl:items-end w-full">
                                    <div className="flex justify-center items-center space-x-4">
                                        <div className="w-8 h-8">
                                            <img className="w-full h-full" alt="logo" src="/Campus_Cart.png" />
                                        </div>
                                        <div className="flex flex-col justify-start items-center">
                                            <p className="text-lg leading-6 dark:text-white font-semibold text-gray-800">Arrival of Orders<br />
                                            <span className="font-normal">Delivery within 3 months</span></p>
                                        </div>
                                    </div>
                                    <p className="xl:mt-4 text-lg font-semibold leading-6 dark:text-white text-[#0A9659]">₱3300.00</p>
                                </div>
                                <div className="w-full flex xl:flex-col gap-2 justify-center items-center">
                                    <button className="hover:bg-[#0CA562] dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 py-3 rounded-sm w-96 md:w-full bg-[#0A9659] text-base font-medium leading-4 text-white">
                                        Cash on Pickup
                                    </button>
                                    <button className="hover:bg-[#0CA562] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 py-3 rounded-sm w-96 md:w-full bg-[#0A9659] text-base font-medium leading-4 text-white">
                                        Payment
                                    </button>
                                </div>
                            </div>
                    </div>
                </div>
            </div>
        </Layout>

    )
}