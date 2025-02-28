import { useDispatch, useSelector } from "react-redux";
import Dropdown from "./Dropdown";
import { Link } from "react-router-dom";
import { AppDispatch } from "../Redux/Store";
import { userLogoutAction } from "../Redux/Actions/User";
import { useState } from "react";
import CheckOut from "../views/Checkout";

function Navbar() {


  const userLoginReducer = useSelector((state: any) => state.userLoginReducer);

  const { userInfo } = userLoginReducer;

  const qty = useSelector((state: any) =>
    state.cartReducer.cartItems.reduce((total: number, item: any) => {
      // Ensure quantity is a valid number
      return total + (Number(item.quantity) || 0); // Default to 0 if quantity is invalid
    }, 0)
  );

  const cartItems = useSelector((state: any) => state.cartReducer.cartItems);
  console.log("Cart Items:", cartItems);

  const [open, setOpen] = useState(false);

  return (

    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="Campus Cart.png" className="h-8 mt-2" alt="Flowbite Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">GC Coop</span>
        </div>
        </Link>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">

          {!userInfo ? (

            <>

            <Link to="/register">

              <button type="button" className="p-btn focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Get Started
              </button>

            </Link>

            <Link to="/login">

              <button type="button" className="ml-1 p-btn focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Sign in
              </button>

            </Link>

            </>

          ) : (
            <>

              <Dropdown />

              <button onClick={()=>setOpen(true)}  data-collapse-toggle="navbar-cta" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-cta" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <span>{qty}</span>
              </button>

              <CheckOut open={open} setOpen={setOpen} />

            </>
          )}

        </div>
        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;