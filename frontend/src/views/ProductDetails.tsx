import { useParams } from "react-router-dom";
import Layout from "../Layout/Layouts";
import { useEffect, useState } from "react";
import { productDetailAction, addToCart } from "../Actions/Product";

type Product = {
    _id: string;
    name: string;
    image: string[];
    description: string;
    category: string[];
    size: string[];
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
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const response = await productDetailAction(id);
                if (response.success) {
                    setProd(response.product.data);
                    if (response.product.data.size && response.product.data.size.length > 0) {
                        setSelectedSize(response.product.data.size[0]);
                    }
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

    const handleAddToCart = () => {
        if (!prod) return;
        
        addToCart({
            _id: prod._id,
            name: prod.name,
            image: prod.image[0], // Use first image as main image
            price: prod.price,
            size: selectedSize,
            quantity: quantity
        });
    };
    
    if (!id) return <Layout><h1>Product ID is missing</h1></Layout>;
    if (loading) return <Layout><h1>Loading...</h1></Layout>;
    if (error) return <Layout><h1>{error}</h1></Layout>;

    return prod ? (
        <Layout>
            <section className="text-gray-600 body-font overflow-hidden">
                <div className="container px-5 py-24 mx-auto">
                    <div className="lg:w-4/5 mx-auto flex flex-wrap">
                        {/* Image Gallery */}
                        <div className="lg:w-1/2 w-full">
                            <img 
                                alt={prod.name} 
                                className="w-full lg:h-auto object-cover object-center rounded" 
                                src={prod.image[selectedImage]}
                            />
                            {/* Thumbnail Gallery */}
                            <div className="flex mt-4 gap-2">
                                {prod.image.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-20 h-20 overflow-hidden rounded ${selectedImage === index ? 'ring-2 ring-green-500' : ''}`}
                                    >
                                        <img 
                                            src={img} 
                                            alt={`${prod.name} thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
                            <h2 className="text-sm title-font text-gray-500 tracking-widest">
                                {prod.category && prod.category.map((cat, index) => (
                                    <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                                        {cat}
                                    </span>
                                ))}
                            </h2>
                            <h1 className="text-gray-900 text-3xl title-font font-medium mb-4">{prod.name}</h1>
                            
                            <div className="flex mb-4">
                                <a className="flex-grow text-green-500 border-b-2 border-green-500 py-2 text-lg px-1">Description</a>
                                <a className="flex-grow border-b-2 border-gray-300 py-2 text-lg px-1">Reviews</a>
                                <a className="flex-grow border-b-2 border-gray-300 py-2 text-lg px-1">Details</a>
                            </div>
                            
                            <p className="leading-relaxed mb-4">{prod.description}</p>
                            
                            {/* Sizes */}
                            {prod.size && prod.size.length > 0 && (
                                <div className="flex items-center mb-4">
                                    <span className="mr-3">Size</span>
                                    <div className="flex gap-2">
                                        {prod.size.map((size, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-2 py-1 border rounded ${
                                                    selectedSize === size 
                                                    ? 'border-green-500 text-green-500' 
                                                    : 'border-gray-300'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="flex items-center mb-4">
                                <span className="mr-3">Quantity</span>
                                <div className="flex items-center border border-gray-300 rounded">
                                    <button 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="px-3 py-1 hover:bg-gray-100"
                                    >
                                        -
                                    </button>
                                    <span className="px-3 py-1">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(q => Math.min(prod.countInStock, q + 1))}
                                        className="px-3 py-1 hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="ml-3 text-gray-500">
                                    ({prod.countInStock} available)
                                </span>
                            </div>

                            <div className="flex items-center border-t border-gray-200 py-2">
                                <span className="text-gray-500">Rating</span>
                                <span className="ml-auto text-gray-900">{prod.rating} ({prod.numReview} reviews)</span>
                            </div>

                            <div className="flex items-center mt-4">
                                <span className="title-font font-medium text-2xl text-gray-900">₱{prod.price}</span>
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={prod.countInStock === 0}
                                    className={`flex ml-auto text-white px-6 py-2 rounded ${
                                        prod.countInStock > 0
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {prod.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                                <button className="rounded-full w-10 h-10 bg-gray-200 p-0 border-0 inline-flex items-center justify-center text-gray-500 ml-4">
                                    <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    ) : null;
}

export default ProductDetail;
