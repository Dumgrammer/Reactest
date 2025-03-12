import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts} from "../Actions/Product";
import Carousel from "./Carousel";


function Product() {
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
                    <div className="container mx-auto">
                        <Carousel></Carousel>
                        <div className="w-full p-4">
                        <h2 className="text-xl font-bold mb-4">Products</h2>
                        <div className="flex flex-wrap -m-4">
                            {products.length > 0 ? (
                                products.map((product: any) => (
                                    <div className="p-4 lg:w-1/4 md:w-1/2" key={product._id}>
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
                        </div></div>
                    </div>
                </section>
            )}
        </div>
    );
}

export default Product;
