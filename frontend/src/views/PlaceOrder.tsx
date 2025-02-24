import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout/Layouts";
import CartItems from "../components/CartItems";
import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { baseUrl } from "../Redux/Constants/BaseUrl";
import { orderAction } from "../Redux/Actions/Order";
import { AppDispatch } from "../Redux/Store";
import { saveShippingAddressAction } from "../Redux/Actions/Cart";

export default function PlaceOrder() {

    const dispatch = useDispatch<AppDispatch>();

    const cart = useSelector((state: any) => state.cartReducer);

    const { cartItems, shippingAddress } = cart;

    const addDecimal = (num: any) => {
        return (Math.round(num * 100) / 100).toFixed(2);
    }

    const subTotal = Number(addDecimal(cartItems.reduce((total: number, item: any) => total + item.quantity * item.price, 0)));

    const shippingFee = Number(subTotal) > 100 ? 20 : 0;

    const total = (Number(subTotal) + Number(shippingFee)).toFixed(2);

    //Shipping Address from our data

    const [address, setAddress] = useState(shippingAddress.address);
    const [city, setCity] = useState(shippingAddress.city);
    const [code, setPostalCode] = useState(shippingAddress.postalCode);
    const [country, setCountry] = useState(shippingAddress.country);

    const [clientId, setClientId] = useState('');

    useEffect(() => {
        getPaypalClientId();
    });

    const getPaypalClientId = async () => {
        const response = await axios.get(`${baseUrl}/api/config/paypal`);
        const fetchedClientId = response.data;

        console.log(response)

        //sets the ClientId from the api    
        setClientId(fetchedClientId);
    };

    const successPaymentHandler = async (paymentResult: any) => {
        try {
            dispatch(orderAction({
                orderItems: cart.cartItems,
                shippingAddress: cart.shippingAddress,
                totalPrice: total,
                paymentMethod: 'paypal',
                price: subTotal,
                shippingPrice: shippingFee,
                taxPrice: shippingFee
            }))
        } catch (error) {
            console.log(error)
        }
    }

    const saveShippingAddress = () => {
       dispatch(
        saveShippingAddressAction({
            address,
            city,
            code,
            country
        })
       );
    };


    return (
        <Layout>
            <section className="text-gray-600 body-font overflow-hidden">
                <div className="container px-5 py-24 mx-auto">
                    <div className="lg:w-4/5 mx-auto flex flex-wrap">
                        <div className="lg:w-1/2 w-full lg:pr-10 lg:py-6 mb-6 lg:mb-0">
                            <h2 className="text-sm title-font text-gray-500 tracking-widest">Order Summary</h2>

                            <p className="leading-relaxed mb-4">
                                <CartItems cartItems={cartItems}> </CartItems>
                            </p>

                            <div className="flex border-t border-gray-200 py-2">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="ml-auto text-gray-900">{subTotal}</span>
                            </div>
                            <div className="flex border-t border-gray-200 py-2">
                                <span className="text-gray-500">Shipping Fee</span>
                                <span className="ml-auto text-gray-900">{shippingFee}</span>
                            </div>
                            <div className="flex">
                                <span className="title-font font-medium text-2xl text-gray-900">$ {total}</span>
                            </div>
                        </div>
                        <div className="lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 relative z-10 shadow-md">
                            <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">Shipping Address</h2>

                            <div className="relative mb-4">
                                <label htmlFor="email" className="leading-7 text-sm text-gray-600">Address</label>
                                <input type="text" id="address" name="address" value={address} onChange={(e: any) => setAddress(e.target.value)} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                            </div>
                            <div className="relative mb-4">
                                <label htmlFor="email" className="leading-7 text-sm text-gray-600">City</label>
                                <input type="text" id="city" name="city" value={city} onChange={(e: any) => setCity(e.target.value)} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                            </div>
                            <div className="relative mb-4">
                                <label htmlFor="email" className="leading-7 text-sm text-gray-600">Postal/Zip Code</label>
                                <input type="text" id="postalcode" name="postalcode" value={code} onChange={(e: any) => setPostalCode(e.target.value)} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                            </div>
                            <div className="relative mb-4">
                                <label htmlFor="email" className="leading-7 text-sm text-gray-600">Country</label>
                                <input type="text" id="country" name="country" value={country} onChange={(e: any) => setCountry(e.target.value)} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                            </div>

                            <button onClick={saveShippingAddress}
                            className="mb-10 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200">
                                Save Shipping Address
                            </button>

                            {clientId && (
                                <PayPalScriptProvider options={{ clientId: clientId, debug: true }}>
                                    <PayPalButtons
                                        createOrder={(data, actions) => {
                                            return actions.order.create({
                                                intent: "CAPTURE",
                                                purchase_units: [
                                                    {
                                                        amount: {
                                                            currency_code: 'PHP',
                                                            value: total
                                                        }
                                                    }
                                                ]
                                            });
                                        }}
                                        onApprove={(data, actions) => {
                                            if (!actions || !actions.order) {
                                              console.error("PayPal order actions are undefined.");
                                              return Promise.reject(new Error("PayPal order actions are missing"));
                                            }
                                          
                                            return actions.order.capture().then((details) => {
                                              console.log("Payment Success:", details);
                                              successPaymentHandler(details);
                                            }).catch(error => {
                                              console.error("Error capturing order:", error);
                                            });
                                          }}
                                          
                                          
                                    />
                                </PayPalScriptProvider>
                            )}



                        </div>

                    </div>
                </div>
            </section>
        </Layout>
    )
}