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
                            <p className="text-lg md:text-xl dark:text-white font-semibold leading-6 xl:leading-5 text-gray-800">Customer’s Cart</p>
                            <div className="mt-4 md:mt-6 flex flex-col justify-start items-start w-full">
                                {cart.length > 0 ? (
                                    cart.map((item, index) => (
                                        <div key={index} className="pb-4 md:pb-8 w-full">
                                            {/* Image block */}
                                            <div className="flex flex-col w-full">
                                                <img className="w-full hidden md:block" src={item.image} alt="dress" />
                                                <img className="w-full md:hidden" src={item.image} alt="dress" />
                                            </div>

                                            {/* Content block */}
                                            <div className="border-b border-gray-200 flex flex-col justify-start items-start w-full pb-8 space-y-4">
                                                <div className="w-full flex flex-col justify-start items-start space-y-8">
                                                    <h3 className="text-xl dark:text-white xl:text-2xl font-semibold leading-6 text-gray-800">{item.name}</h3>
                                                    <div className="flex justify-start items-start flex-col space-y-2">
                                                        <p className="text-sm dark:text-white leading-none text-gray-800">
                                                            <span className="dark:text-gray-400 text-gray-300">Quantity: </span> {item.quantity}
                                                        </p>
                                                        <p className="text-sm dark:text-white leading-none text-gray-800">
                                                            <span className="dark:text-gray-400 text-gray-300">Price: </span> ₱{item.price}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between space-x-8 items-start w-full">
                                                    <p className="text-base dark:text-white xl:text-lg leading-6">$36.00</p>
                                                    <p className="text-base dark:text-white xl:text-lg leading-6 text-gray-800">01</p>
                                                    <p className="text-base dark:text-white xl:text-lg font-semibold leading-6 text-gray-800">₱3000</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-lg dark:text-white text-gray-800">Your cart is empty.</p>
                                )}
                            </div>



                        </div>
                        <div className="flex justify-center flex-col md:flex-row flex-col items-stretch w-full space-y-4 md:space-y-0 md:space-x-6 xl:space-x-8">
                            <div className="flex flex-col px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50 dark:bg-gray-800 space-y-6">
                                <h3 className="text-xl dark:text-white font-semibold leading-5 text-gray-800">Summary</h3>
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
                            <div className="flex flex-col justify-center px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50 dark:bg-gray-800 space-y-6">
                                <h3 className="text-xl dark:text-white font-semibold leading-5 text-gray-800">Payment</h3>
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex justify-center items-center space-x-4">
                                        <div className="w-8 h-8">
                                            <img className="w-full h-full" alt="logo" src="/Campus_Cart.png" />
                                        </div>
                                        <div className="flex flex-col justify-start items-center">
                                            <p className="text-lg leading-6 dark:text-white font-semibold text-gray-800">Arrival of Orders<br /><span className="font-normal">Delivery within 3 months</span></p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-semibold leading-6 dark:text-white text-gray-800">₱3300.00</p>
                                </div>
                                <div className="w-full flex justify-center items-center">
                                    <button className="hover:bg-black dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 py-5 w-96 md:w-full bg-gray-800 text-base font-medium leading-4 text-white">
                                        Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 w-full xl:w-96 flex justify-between items-center md:items-start px-4 py-6 md:p-6 xl:p-8 flex-col">
                        <h3 className="text-xl dark:text-white font-semibold leading-5 text-gray-800">Customer</h3>
                        <div className="flex flex-col md:flex-row xl:flex-col justify-start items-stretch h-full w-full md:space-x-6 lg:space-x-8 xl:space-x-0">
                            <div className="flex flex-col justify-start items-start flex-shrink-0">

                                <div className="flex justify-center text-gray-800 dark:text-white md:justify-start items-center space-x-4 py-4 border-b border-gray-200 w-full">
                                    <img className="dark:hidden" src="/logo192.png" alt="email" />
                                    <img className="hidden dark:block" src="/logo192.png" alt="email" />
                                    <p className="cursor-pointer text-sm leading-5 ">appgradesolutions@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex justify-between xl:h-full items-stretch w-full flex-col mt-6 md:mt-0">
                                <div className="flex justify-center md:justify-start xl:flex-col flex-col md:space-x-6 lg:space-x-8 xl:space-x-0 space-y-4 xl:space-y-12 md:space-y-0 md:flex-row items-center md:items-start">
                                    <div className="flex justify-center md:justify-start items-center md:items-start flex-col space-y-4 xl:mt-8">
                                        <p className="text-base dark:text-white font-semibold leading-4 text-center md:text-left text-gray-800">Yr - Block</p>
                                        <p className="w-48 lg:w-full dark:text-gray-300 xl:w-48 text-center md:text-left text-sm leading-5 text-gray-600">Diyan lang</p>
                                    </div>

                                </div>
                                <div className="flex w-full justify-center items-center md:justify-start md:items-start">
                                    <button className="mt-6 md:mt-0 dark:border-white dark:hover:bg-gray-900 dark:bg-transparent dark:text-white py-5 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 border border-gray-800 font-medium w-96 2xl:w-full text-base font-medium leading-4 text-gray-800">
                                        Edit Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>

    )
}