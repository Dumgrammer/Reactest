import Carousel from "../components/Carousel";
import Product from "../components/Product";
import Layout from "../Layout/Layouts";
import Searched from "./Searched";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home(){
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return(
        <Layout>
            <form onSubmit={handleSearchSubmit} className="max-w-xl lg:max-w-4xl mb-4 mx-auto">   
                <label htmlFor="search-input" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-6 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input 
                        type="search" 
                        id="search-input" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search block w-full p-4 ps-10 text-sm text-gray-900 bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500" 
                        placeholder="Search Products..." 
                        required 
                    />
                    <button type="submit" className="absolute end-2.5 bottom-2.5 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-white">Search</button>
                </div>
            </form>
            <Carousel></Carousel>
            <Product></Product>
        </Layout>
    )
}