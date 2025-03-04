import { useParams } from "react-router-dom";
import Layout from "../Layout/Layouts";
import { useEffect, useState } from "react";
import { productDetailAction } from "../Actions/Product";

type Product = {
    _id: string;
    name: string;
    image: string;
    description: string;
    rating: number;
    numReview: number;
    price: number;
    countInStock: number;
};

function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const [prod, setProd] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const response = await productDetailAction(id);
                if (response.success) {
                    setProd(response.product.data);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError("Failed to fetch product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (!id) return <Layout><h1>Product ID is missing</h1></Layout>;
    if (loading) return <Layout><h1>Loading...</h1></Layout>;
    if (error) return <Layout><h1>{error}</h1></Layout>;

    return prod ? (
        <Layout>
            <section className="text-gray-600 body-font overflow-hidden">
                <div className="container px-5 py-24 mx-auto">
                    <div className="lg:w-4/5 mx-auto flex flex-wrap">
                        <div className="lg:w-1/2 w-full lg:pr-10 lg:py-6 mb-6 lg:mb-0">
                            <h2 className="text-sm title-font text-gray-500 tracking-widest">Reviews {prod.numReview}</h2>
                            <h1 className="text-gray-900 text-3xl title-font font-medium mb-4">{prod.name}</h1>
                            <div className="flex mb-4">
                                <a className="flex-grow text-indigo-500 border-b-2 border-indigo-500 py-2 text-lg px-1">Description</a>
                                <a className="flex-grow border-b-2 border-gray-300 py-2 text-lg px-1">Reviews</a>
                                <a className="flex-grow border-b-2 border-gray-300 py-2 text-lg px-1">Details</a>
                            </div>
                            <p className="leading-relaxed mb-4">{prod.description}</p>
                            <div className="flex border-t border-gray-200 py-2">
                                <span className="text-gray-500">Ratings</span>
                                <span className="ml-auto text-gray-900">{prod.rating}</span>
                            </div>
                            <div className="flex border-t border-b mb-6 border-gray-200 py-2">
                                <span className="text-gray-500">Quantity</span>
                                <span className="ml-auto text-gray-900">{prod.countInStock}</span>
                            </div>
                            <div className="flex">
                                <span className="title-font font-medium text-2xl text-gray-900">₱ {prod.price}</span>
                                <button className="flex ml-auto text-white bg-green-500 border-0 py-2 px-6 focus:outline-none hover:bg-green-600 rounded">Check out</button>
                                <button className="rounded-full w-10 h-10 bg-gray-200 p-0 border-0 inline-flex items-center justify-center text-gray-500 ml-4">
                                    <svg fill="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <img alt="ecommerce" className="lg:w-1/2 w-full lg:h-auto h-64 object-cover object-center rounded" src={prod.image}/>
                    </div>
                </div>
            </section>
        </Layout>
    ) : null;
}

export default ProductDetail;
