import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts} from "../Actions/Product";


function Searched() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getProducts = async () => {
            setLoading(true);
            const response = await fetchProducts();
            console.log(response)
            setLoading(false);

            if (!response.success) {
                setError(response.message);
            } else {
                setProducts(response.products.data);
            }
        };
        getProducts();
    }, []);

    return (
        <div>
            {loading ? (
                <h1>Loading...</h1>
            ) : error ? (
                <h1>{error}</h1>
            ) : (
                <section className="text-gray-600 body-font">
                    {/* Search Bar from Carousel */}
                    <form className="max-w-xl lg:max-w-4xl mb-4 mx-auto">   
                        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-6 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>
                            <input type="search" id="default-search" className="search block w-full p-4 ps-10 text-sm text-gray-900  bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Products..." required />
                        </div>
                    </form>
                    <div className="container mx-auto">
                        <div className="w-full p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Filters 1 */}
                        <div className="space-y-4 p-4 bg-white rounded-md shadow-sm">
                            {/* by Category */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Category</label>
                                <div className="mt-2 space-y-1">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded border-gray-300" value="category1" />
                                        <span>Category 1</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded border-gray-300" value="category2" />
                                        <span>Category 2</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded border-gray-300" value="category3" />
                                        <span>Category 3</span>
                                    </label>
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Price Range</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input type="number" placeholder="Min" className="w-1/2 p-2 border border-gray-300 rounded-md" />
                                    <span>-</span>
                                    <input type="number" placeholder="Max" className="w-1/2 p-2 border border-gray-300 rounded-md" />
                                </div>
                                <button className="w-full mt-2 p-2 bg-blue-500 text-white rounded-md">Apply</button>
                            </div>

                            {/* by Size */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Size</label>
                                <select className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                                    <option value="">All Sizes</option>
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                                <div className="mt-2 space-y-1">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded border-gray-300" value="small" />
                                        <span>Small</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded border-gray-300" value="medium" />
                                        <span>Medium</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded border-gray-300" value="large" />
                                        <span>Large</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col lg:col-span-2">
                        <div>
                            <h2 className="text-xl font-bold mb-4">Search result for 'searched-term'</h2>
                            {/* Filters 2 */}
                            <div className="flex flex-col w-full space-y-2 lg:flex-row lg:justify-between">
                                {/* by Type */}
                                <div className="flex flex-col lg:flex-row lg:items-center">
                                    <label className="block text-sm font-bold text-gray-700 lg:mr-2">Type</label>
                                    <select className="p-2 border border-gray-300 rounded-md">
                                        <option value="">All Types</option>
                                        <option value="type1">Type 1</option>
                                        <option value="type2">Type 2</option>
                                        <option value="type3">Type 3</option>
                                    </select>
                                </div>
                                {/* Sort Price */}
                                <div className="flex flex-col lg:flex-row lg:items-center">
                                    <label className="block text-sm font-bold text-gray-700 lg:mr-2">Sort by Price</label>
                                    <select className="p-2 border border-gray-300 rounded-md">
                                        <option value="low-to-high">Low to High</option>
                                        <option value="high-to-low">High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        {/* Products */}
                        <div className="flex flex-wrap -m-4">
                            {products.length > 0 ? (
                                products.map((product: any) => (
                                    <div className="p-4 lg:w-1/2 md:w-full" key={product._id}>
                                        <div className="bg-white">
                                            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                                                <div className="mt-6 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                                                    <div className="group relative">
                                                        <img
                                                            src={Array.isArray(product.image) ? product.image[0] : product.image}
                                                            alt={product.name}
                                                            className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                                                        />
                                                        <div className="mt-4 flex justify-between">
                                                            <div>
                                                                <h3 className="text-sm text-gray-700">
                                                                    <Link to={`/products/${product._id}`}>
                                                                        <span aria-hidden="true" className="absolute inset-0"></span>
                                                                        {product.name}
                                                                    </Link>
                                                                </h3>
                                                                <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-900">${product.price}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <h2>No products available.</h2>
                            )}
                            </div>
                            {/* Products End */}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

export default Searched;
