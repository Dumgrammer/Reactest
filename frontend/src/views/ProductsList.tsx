import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import AddProductModal from "../components/AddProduct";
import EditProductModal from "../components/EditProduct";
import { fetchProducts, productDeleteAction } from "../Actions/Product";

import { Dialog, DialogPanel, DialogTitle, Description } from "@headlessui/react";

export default function ProductsList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

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

    // Add Modal
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    // Edit Modal
    const handleOpenEditModal = (product: any) => {
        setSelectedProduct(product); 
        setIsEditOpen(true);
    };
    const handleCloseEditModal = () => {
        setSelectedProduct(null);
        setIsEditOpen(false);
    };

    // Open/Delete Delete Confirmation Modal
    const handleOpenDeleteModal = (id: string) => {
        setDeleteProductId(id);
        setIsDeleteOpen(true);
    };
    const handleCloseDeleteModal = () => {
        setDeleteProductId(null);
        setIsDeleteOpen(false);
    };

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

    const handleProductUpdated = async () => {
        setIsEditOpen(false);
        setLoading(true);
        const response = await fetchProducts();
        setLoading(false);

        if (!response.success) {
            setError(response.message);
        } else {
            setProducts(response.products.data);
        }
    };

    const handleProductDeletion = async (id: string) => {
        if (deleteProductId){
            await productDeleteAction(id);
            setLoading(true);
            const response = await fetchProducts();
            setLoading(false);
        
            if (!response.success) {
                setError(response.message);
            } else {
                setProducts(response.products.data);
            }
            setIsDeleteOpen(false);
        }
    };
    

    return (
        <AdminLayout>
            {/* Add Product */}
            <div className="flex justify-end">
                <button type="button" onClick={handleOpenModal} className="text-white bg-green-500 border  hover:bg-green-600 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-2 mb-2 dark:bg-gray-800 dark:text-white">
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
                    <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
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
                                            <a href="#" onClick={() => handleOpenEditModal(product)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={ () => handleOpenDeleteModal(product._id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
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
                    </div>
                )}
            </div>
            {/* Edit Product Modal */}
            {selectedProduct && (
                <EditProductModal
                    isOpen={isEditOpen}
                    onClose={handleCloseEditModal}
                    onProductUpdated={handleProductUpdated}
                    product={selectedProduct}
                />
            )}

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onClose={handleCloseDeleteModal} className="relative z-50">
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black bg-opacity-50">
                    <DialogPanel className="max-w-lg space-y-4 border bg-white p-12 rounded-lg">
                        <DialogTitle className="font-bold text-xl">Delete Product</DialogTitle>
                        <Description>Are you sure you want to delete this product?</Description>
                        <p>This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleCloseDeleteModal}
                                className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleProductDeletion(deleteProductId!)}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-800">
                                Delete
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
            
        </AdminLayout>
    );
}
