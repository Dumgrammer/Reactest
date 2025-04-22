import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../Actions/Product";
import Carousel from "./Carousel";

interface InventoryItem {
    size: string;
    type: string;
    quantity: number;
}

interface ProductItem {
    _id: string;
    name: string;
    image: string[] | string;
    description: string;
    price: number;
    countInStock: number;
    size: string[];
    type: string[];
    inventory: InventoryItem[];
}

function Product() {
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getProducts = async () => {
            setLoading(true);
            const response = await fetchProducts();
            setLoading(false);

            if (!response.success) {
                setError(response.message);
            } else {
                setProducts(response.products.data);
            }
        };
        getProducts();
    }, []);

    // Function to determine stock status display
    const getStockStatusDisplay = (stockCount: number) => {
        if (stockCount > 10) {
            return <span className="text-green-600 text-xs">In Stock</span>;
        } else if (stockCount > 0) {
            return <span className="text-yellow-600 text-xs">Low Stock</span>;
        } else {
            return <span className="text-red-600 text-xs">Out of Stock</span>;
        }
    };

    // Function to get inventory quantity for a specific size
    const getSizeQuantity = (product: ProductItem, size: string): number => {
        if (!product.inventory) return 0;
        
        // Sum quantity across all types for this size
        return product.inventory
            .filter(item => item.size === size)
            .reduce((sum, item) => sum + item.quantity, 0);
    };

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 p-4">{error}</div>
            ) : (
                <section className="text-gray-600 body-font">
                    <div className="container mx-auto">
                        {/* <Carousel /> */}
                        <div className="w-full p-4">
                            <h2 className="text-xl font-bold mb-4">Products</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                            <Link to={`/products/${product._id}`}>
                                                <div className="relative aspect-square overflow-hidden">
                                                    <img
                                                        src={Array.isArray(product.image) ? product.image[0] : product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                    />
                                                </div>
                                            </Link>
                                            <div className="p-4">
                                                <Link to={`/products/${product._id}`} className="block">
                                                    <h3 className="text-lg font-semibold mb-1 text-gray-800 hover:text-green-600">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-green-600 font-bold">${product.price.toFixed(2)}</span>
                                                    {getStockStatusDisplay(product.countInStock)}
                                                </div>
                                                
                                                {/* Size Availability */}
                                                {product.size && product.size.length > 0 && (
                                                    <div className="mt-2">
                                                        <span className="text-xs text-gray-500">Available sizes:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {product.size.map((size, index) => {
                                                                const quantity = getSizeQuantity(product, size);
                                                                const isAvailable = quantity > 0;
                                                                
                                                                return (
                                                                    <span 
                                                                        key={index} 
                                                                        className={`inline-block text-xs px-2 py-1 rounded relative
                                                                            ${isAvailable 
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : 'bg-gray-100 text-gray-500'
                                                                            }`}
                                                                    >
                                                                        {size}
                                                                        {isAvailable && (
                                                                            <span className="absolute -top-2 -right-2 bg-white text-xs rounded-full px-1.5 py-0.5 border border-green-300 text-green-800">
                                                                                {quantity}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <Link to={`/products/${product._id}`} className="block mt-3">
                                                    <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors duration-200 text-sm">
                                                        View Details
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <p className="text-gray-500 text-lg">No products available.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

export default Product;
