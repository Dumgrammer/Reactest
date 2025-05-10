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
                    <input 
                        type="search" 
                        id="search-input" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-btn rounded-md block w-full p-4 ps-7 pr-[60px] text-sm text-gray-900 bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500" 
                        placeholder="Search Products..." 
                        required 
                    />
                    <button type="submit" className="absolute end-2.5 bottom-2.5 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-white"><i className="fa fa-search"></i></button>
                </div>
            </form>
            <Carousel></Carousel>
            <Product></Product>
        </Layout>
    )
}