import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const NavBar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-white border-gray-200 dark:bg-gray-900">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="/" className="flex items-center">
                    <img src="/logo.png" className="h-8 mr-3" alt="Logo" />
                </a>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-controls="navbar-user"
                    aria-expanded="false"
                >
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>
                <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-user">
                    <ul className="flex flex-col p-4 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:p-0 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) => isActive 
                                    ? "block pl-3 pr-4 py-2 px-2 text-[#0a9659]  bg-transparent md:p-0 md:dark:text-blue-500"
                                    : "block pl-3 pr-4 py-2 px-2 text-gray-900 bg-transparent hover:text-[#0a9659] md:p-0 md:dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                                }
                            >
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) => isActive 
                                    ? "block pl-3 pr-4 py-2 px-2 text-[#0a9659]  bg-transparent md:p-0 md:dark:text-blue-500"
                                    : "block pl-3 pr-4 py-2 px-2 text-gray-900 bg-transparent hover:text-[#0a9659] md:p-0 md:dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                                }
                            >
                                Profile
                            </NavLink>
                        </li>
                        {/* Rest of the navigation links */}
                    </ul>
                </div>
                <div className={`items-center justify-between ${isMobileMenuOpen ? 'block' : 'hidden'} w-full md:hidden`} id="navbar-user">
                    <ul className="flex flex-col font-medium p-4 border border-gray-100 rounded-lg bg-gray-50 mt-4 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) => isActive 
                                    ? "block pl-3 pr-4 py-2 text-white rounded bg-[#0a9659] md:bg-transparent md:text-[#0a9659]  md:p-0 md:dark:text-blue-500"
                                    : "block pl-3 pr-4 py-2 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#0a9659] md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                                }
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) => isActive 
                                    ? "block pl-3 pr-4 py-2 text-white rounded bg-[#0a9659] md:bg-transparent md:text-[#0a9659]  md:p-0 md:dark:text-blue-500"
                                    : "block pl-3 pr-4 py-2 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#0a9659] md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                                }
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Profile
                            </NavLink>
                        </li>
                        {/* Rest of the mobile menu links */}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavBar; 