import Card from "../components/Card";
import AdminLayout from "../Layout/AdminLayout";
import AddProductModal from "../components/AddProduct";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../Redux/Store";
import { productListAction } from "../Redux/Actions/Product";

export default function ProductsList() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, products = [] } = useSelector((state: any) => state.productListReducer);

    useEffect(() => {
        if (!loading && !products.length) {
            dispatch(productListAction());
        }
    }, [dispatch, loading, products.length]);

    return (
        <AdminLayout>
            {/* Add Product */}
            <div className="flex justify-end">
                <button type="button" onClick={handleOpenModal} className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-2 mb-2 dark:bg-gray-800 dark:text-white">
                    Add Product
                </button>

                <AddProductModal isOpen={isModalOpen} onClose={handleCloseModal} />
            </div>

            {/* Product List */}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
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
                        {products.map((product: any) => (
                            <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {product.name}
                                </th>
                                <td className="px-6 py-4">{product.price}</td>
                                <td className="px-6 py-4">{product.countInStock}</td>
                                <td className="px-6 py-4">{product.rating}</td>
                                <td className="px-6 py-4 text-right">
                                    <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <a href="#" className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
