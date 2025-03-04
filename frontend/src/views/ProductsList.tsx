import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import AddProductModal from "../components/AddProduct";
import { fetchProducts } from "../Actions/Product";

export default function ProductsList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
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

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    
    const handleProductAdded = async () => {
        setIsModalOpen(false);
        setLoading(true);
        const response = await fetchProducts();
        setLoading(false);

        if (!response.success) {
            setError(response.message);
        } else {
            setProducts(response.products.data);
        }
    };


    return (
        <AdminLayout>
            {/* Add Product */}
            <div className="flex justify-end">
                <button type="button" onClick={handleOpenModal} className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-2 mb-2 dark:bg-gray-800 dark:text-white">
                    Add Product
                </button>

                <AddProductModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onProductAdded={handleProductAdded}
                />

            </div>

            {/* Product List */}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                {loading ? (
                    <h1>Loading...</h1>
                ) : error ? (
                    <h1 className="text-red-500">{error}</h1>
                ) : (
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Product name</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Stock</th>
                                <th className="px-6 py-3">Rating</th>
                                <th className="px-6 py-3"><span className="sr-only">Edit</span></th>
                                <th className="px-6 py-3"><span className="sr-only">Delete</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map((product: any) => (
                                    <tr key={product._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {product.name}
                                        </th>
                                        <td className="px-6 py-4">${product.price}</td>
                                        <td className="px-6 py-4">{product.countInStock}</td>
                                        <td className="px-6 py-4">{product.rating}</td>
                                        <td className="px-6 py-4 text-right">
                                            <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a href="#" className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-gray-500">No products available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
}
