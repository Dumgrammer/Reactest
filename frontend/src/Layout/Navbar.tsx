import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Dropdown from "./Dropdown";
import CheckOut from "../views/Checkout";
import { useNavigate } from "react-router-dom";
import "../Styles/style1.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo") || "null");
  });

  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  const updateCartCount = () => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const count = storedCart.reduce(
      (acc: any, item: any) => acc + (item.quantity || 0),
      0,
    );
    setTotalItems(count);
  };

  const handleCartClick = () => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    setOpen(true);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = JSON.parse(localStorage.getItem("userInfo") || "null");
      setUserInfo(storedUser);
    };

    // Initial cart count
    updateCartCount();

    // Listen for storage changes (from other tabs)
    window.addEventListener("storage", handleStorageChange);
    // Listen for cart updates from current tab
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <nav className="border-gray-200 bg-white dark:bg-gray-900">
      <div className="header-cont mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link to="/">
          <div className=" flex items-center space-x-3 rtl:space-x-reverse">
            <img
              src="/Campus_Cart.png"
              className="mt-2 h-8"
              alt="Campus Cart Logo"
            />
            <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
              GC Coop
            </span>
          </div>
        </Link>
        <div className="header-btn flex space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
          {!userInfo ? (
            <>
              <Link to="/register">
                <button className="p-btn rounded-lg px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                  Get Started
                </button>
              </Link>

              <Link to="/login">
                <button className="p-btn ml-1 rounded-lg px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                  Sign in
                </button>
              </Link>
            </>
          ) : (
            <>
              <Dropdown />
              <button
                onClick={handleCartClick}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
                <span>{totalItems}</span>
              </button>

              <CheckOut open={open} setOpen={setOpen} />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
