import { useParams, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layouts";
import { useEffect, useState } from "react";
import { productDetailAction, addToCart } from "../Actions/Product";
import Success from "../components/modals/Success";
import Failed from "../components/modals/Failed";

type InventoryItem = {
    size: string;
    type: string;
    quantity: number;
};

type Product = {
    _id: string;
    name: string;
    image: string[];
    description: string;
    category: string;
    size: string[];
    type: string[];
    rating: number;
    numReview: number;
    price: number;
    countInStock: number;
    inventory: InventoryItem[];
    totalStock: number;
};

function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [prod, setProd] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [availableQuantity, setAvailableQuantity] = useState(0);

    // Success Modal
    const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);
    // Failed Modal
    const [isFailedOpen, setIsFailedOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const response = await productDetailAction(id);
                if (response.success) {
                    setProd(response.product.data);
                    // Set initial selections
                    if (response.product.data.size && response.product.data.size.length > 0) {
                        setSelectedSize(response.product.data.size[0]);
                    }
                    if (response.product.data.type && response.product.data.type.length > 0) {
                        setSelectedType(response.product.data.type[0]);
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

    // Update available quantity when size or type changes
    useEffect(() => {
        if (!prod) return;

        // Find inventory item for selected size and type
        const inventoryItem = prod.inventory?.find(
            item => item.size === selectedSize && item.type === selectedType
        );

        // Set available quantity
        setAvailableQuantity(inventoryItem?.quantity ?? prod.countInStock);
        
        // Reset quantity if current selection exceeds available
        if (quantity > (inventoryItem?.quantity ?? prod.countInStock)) {
            setQuantity(1);
        }
    }, [selectedSize, selectedType, prod]);

    // Add auto-slide effect
    useEffect(() => {
        if (!prod || prod.image.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                prevIndex === prod.image.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(timer);
    }, [prod]);

    const handleImageChange = (index: number) => {
        setCurrentImageIndex(index);
    };

    const handleAddToCart = () => {
        const userInfo = localStorage.getItem("userInfo");
        if (!userInfo) {
            navigate("/login");
            return;
        }

        if (!prod) {
            setIsFailedOpen(true);  
            return;
        } 
        
        addToCart({
            _id: prod._id,
            name: prod.name,
            image: prod.image[0],
            price: prod.price,
            size: selectedSize,
            type: selectedType,
            quantity: quantity
        });

        setIsSuccessOpen(true);
    };
    
    const incrementQuantity = () => {
        if (quantity < availableQuantity) {
            setQuantity(prev => prev + 1);
        }
    };
    
    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };
    
    if (!id) return <Layout><h1>Product ID is missing</h1></Layout>;
    if (loading) return <Layout><div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div></Layout>;
    if (error) return <Layout><div className="text-center text-red-500 p-4">{error}</div></Layout>;

    return prod ? (
        <Layout>
            <section className="text-gray-600 body-font overflow-hidden">
                <div className="container px-5 py-24 mx-auto">
                    <div className="lg:w-4/5 mx-auto flex flex-wrap">
                        {/* Image Section - Now on the left */}
                        <div className="lg:w-1/2 w-full h-auto lg:object-cover object-center rounded mb-6 lg:mb-0">
                            <div className="relative">
                                <img 
                                    alt={prod.name} 
                                    className="w-full h-full object-cover rounded-lg transition-opacity duration-300" 
                                    src={prod.image[currentImageIndex]} 
                                />
                                {prod.image.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                        {prod.image.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleImageChange(index)}
                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                                    currentImageIndex === index ? 'bg-white w-4' : 'bg-white/50'
                                                }`}
                                                aria-label={`Go to image ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Image Gallery */}
                            {prod.image.length > 1 && (
                                <div className="mt-4 grid grid-cols-4 gap-2">
                                    {prod.image.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleImageChange(index)}
                                            className={`relative aspect-square rounded-md overflow-hidden transition-all duration-300 ${
                                                currentImageIndex === index ? 'ring-2 ring-green-500' : 'hover:opacity-75'
                                            }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${prod.name} view ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details Section - Now on the right */}
                        <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6">
                            <h2 className="text-sm title-font text-gray-500 tracking-widest">{prod.category}</h2>
                            <h1 className="text-gray-900 text-3xl title-font font-medium mb-4">{prod.name}</h1>
                            
                            

                            <div className="flex mb-4">
                                <a className="flex-grow text-indigo-500 border-b-2 border-indigo-500 py-2 text-lg px-1">Description</a>
                            </div>
                            <p className="leading-relaxed mb-4">{prod.description}</p>

                            {/* Type Selection - Only show if types exist */}
                            {prod.type && prod.type.length > 0 && (
                                <div className="flex border-t border-gray-200 py-2">
                                    <span className="text-gray-500">Type</span>
                                    <div className="flex flex-wrap gap-2 ml-4">
                                        {prod.type.map((t: string) => (
                                            <button
                                                key={t}
                                                onClick={() => setSelectedType(t)}
                                                className={`px-4 py-2 border-2 rounded-md text-sm ${
                                                    selectedType === t
                                                    ? 'bg-green-50 border-green-500 text-green-700'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-700'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection - Only show if sizes exist */}
                            {prod.size && prod.size.length > 0 && (
                                <div className="flex border-t border-gray-200 py-2">
                                    <span className="text-gray-500">Size</span>
                                    <div className="flex flex-wrap gap-2 ml-4">
                                        {prod.size.map((s: string) => {
                                            // Find inventory for this size and selected type
                                            const inventoryItem = prod.inventory?.find(
                                                item => item.size === s && item.type === selectedType
                                            );
                                            const stockAvailable = (inventoryItem?.quantity ?? 0) > 0;
                                            
                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() => setSelectedSize(s)}
                                                    disabled={!stockAvailable}
                                                    className={`px-4 py-2 border-2 rounded-md text-sm relative ${
                                                        selectedSize === s
                                                        ? 'bg-green-50 border-green-500 text-green-700'
                                                        : stockAvailable
                                                          ? 'bg-white border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-700'
                                                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {s}
                                                    
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="flex border-t border-gray-200 py-2">
                                <span className="text-gray-500">Quantity</span>
                                <div className="ml-auto flex items-center">
                                    <button 
                                        onClick={decrementQuantity}
                                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-100 hover:bg-gray-200"
                                        disabled={quantity <= 1}
                                    >
                                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                        </svg>
                                    </button>
                                    <span className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-300 bg-white">
                                        {quantity}
                                    </span>
                                    <button 
                                        onClick={incrementQuantity}
                                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-100 hover:bg-gray-200"
                                        disabled={quantity >= availableQuantity}
                                    >
                                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="flex border-t border-gray-200 py-2">
                                <span className="text-gray-500">Stock Status</span>
                                <span className={`ml-auto ${availableQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {availableQuantity > 0 
                                        ? `In Stock (${availableQuantity} available)`
                                        : 'Out of Stock'
                                    }
                                </span>
                            </div>

                            <div className="flex items-center mt-6">
                                <span className="title-font font-medium text-2xl text-gray-900">₱ {prod.price}</span>
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={availableQuantity === 0 || (!prod.size && !prod.type) || (prod.size && !selectedSize) || (prod.type && !selectedType)}
                                    className={`flex ml-auto text-white px-6 py-2 rounded-md transition-colors duration-200 ${
                                        availableQuantity > 0 && ((!prod.size && !prod.type) || (prod.size && selectedSize) || (prod.type && selectedType))
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {availableQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                                <button className="rounded-full w-10 h-10 bg-gray-200 p-0 border-0 inline-flex items-center justify-center text-gray-500 ml-4 hover:bg-gray-300 transition-colors duration-200">
                                    <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Modal for Add Product */}
            <Success
                isOpen={isSuccessOpen}
                gif={
                <>
                <img className='mx-auto w-1/3 saturate-200' src="/success.gif"/>
                </>
                }
                title="Item Added to Cart" 
                message={`${quantity} ${quantity > 1 ? 'items' : 'item'} of ${prod.name} ${selectedSize ? `(Size: ${selectedSize})` : ''} ${selectedType ? `(Type: ${selectedType})` : ''} added to your cart`}
                buttonText="Got it, thanks!"
                onConfirm={() => setIsSuccessOpen(false)}
            />

            {/* Failed Modal*/}
            <Failed
                isOpen={isFailedOpen} 
                title="Oops!" 
                message="There was an issue processing your request. Please try again"
                buttonText="OK"
                onConfirm={() => setIsFailedOpen(false)}
            />
        </Layout>
    ) : null;
}

export default ProductDetail;

