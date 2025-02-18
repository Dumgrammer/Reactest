import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLogoutAction } from "../Redux/Actions/User";
import { AppDispatch } from "../Redux/Store";

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const userLoginReducer = useSelector((state: any) => state.userLoginReducer);
  const { userInfo } = userLoginReducer;

  const dispatch = useDispatch<AppDispatch>();
  
  const logoutHandler = () => {
    dispatch(userLogoutAction());
  }

  return (
    <div className="relative pr-2">
      <button
        id="dropdownDefaultButton"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
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

      {isOpen && (
        <div className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 absolute mt-2">
          <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
            <div>{ userInfo.data.name }</div>
            <div className="font-medium truncate">{ userInfo.email }</div>
          </div>
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownInformationButton">
            <li>
              <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
            </li>
            <li>
              <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
            </li>
          </ul>
          <div className="py-2" onClick={logoutHandler} >
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</a>
          </div>
        </div>
      )}
    </div>
  );
}