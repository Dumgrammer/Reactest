import { useState } from "react";
import { userLogout } from "../Actions/User";
import { Link } from "react-router-dom";

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");

  const handleLogout = () => {
    userLogout();
    setIsOpen(false);
  };

  return (
    <div className="relative pr-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 
                   font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center 
                   dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-blue-800"
      >
        Menu
        <svg
          className="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow-md dark:bg-gray-700 z-30">
          {/* User Info */}
          <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
            <div>{userInfo?.data.name || "Guest"}</div>
            <div className="font-medium truncate">{userInfo?.data.email || "No email"}</div>
          </div>

          {/* Menu Buttons */}
          <div className="py-1" role="none">
            <span className="block px-4 py-2 text-sm text-gray-700 truncate font-medium bg-gray-100">
              {userInfo ? (userInfo.data?.name || 'User') : 'Guest'}
            </span>
            
            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
              Profile
            </Link>
            
            <Link to="/myorders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
              My Orders
            </Link>
            
            {userInfo?.data?.isAdmin && (
              <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                Admin Dashboard
              </Link>
            )}

            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
