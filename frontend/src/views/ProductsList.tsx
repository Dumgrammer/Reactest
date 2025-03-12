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
        if (deleteProductId) {
            try {
                const deleteResponse = await productDeleteAction(id);
                if (!deleteResponse.success) {
                    setError(deleteResponse.message);
                    return;
                }

                setLoading(true);
                const response = await fetchProducts();
                setLoading(false);
            
                if (!response.success) {
                    setError(response.message);
                } else {
                    setProducts(response.products.data);
                }
                setIsDeleteOpen(false);
                setDeleteProductId(null);
            } catch (error: any) {
                setError(error.message || "Failed to delete product");
                setIsDeleteOpen(false);
            }
        }
    };
    

    return (
        <AdminLayout>
            <div className="px-6 py-4">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
                    <button
                        type="button"
                        onClick={handleOpenModal}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </button>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="mt-2 text-red-600">{error}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.length > 0 ? (
                                        products.map((product: any) => (
                                            <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={Array.isArray(product.image) ? product.image[0] : product.image}
                                                                alt={product.name}
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                            <div className="text-sm text-gray-500">{product.type}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        product.countInStock > 10 
                                                            ? 'bg-green-100 text-green-800'
                                                            : product.countInStock > 0
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {product.countInStock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleOpenEditModal(product)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenDeleteModal(product._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <p className="mt-2 text-sm">No products available.</p>
                                                <button
                                                    onClick={handleOpenModal}
                                                    className="mt-4 text-sm text-green-600 hover:text-green-500"
                                                >
                                                    Add your first product
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <AddProductModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onProductAdded={handleProductAdded}
                />

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
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
                            <DialogTitle className="text-xl font-semibold text-gray-900 mb-4">
                                Delete Product
                            </DialogTitle>
                            <Description className="text-sm text-gray-500 mb-4">
                                Are you sure you want to delete this product? This action cannot be undone.
                            </Description>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={handleCloseDeleteModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleProductDeletion(deleteProductId!)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Delete
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
