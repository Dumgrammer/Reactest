import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import AddProductModal from "../components/AddProduct";
import EditProductModal from "../components/EditProduct";
import { fetchAdminProducts, productDeleteAction, fetchProducts, productRestoreAction, fetchArchivedProducts, fetchLogs } from "../Actions/Product";
import { Dialog, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import Success from "../components/modals/Success";
import Failed from "../components/modals/Failed";

interface ProductType {
    _id: string;
    name: string;
    description: string;
    price: number;
    countInStock: number;
    category: string;
    type: string[];
    size: string[];
    image: string[];
    inventory: any[];
    totalStock?: number;
    rating?: number;
    numReview?: number;
    createdAt: string;
    updatedAt: string;
    isNotArchived?: boolean;
}

interface LogType {
    _id: string;
    user: {
        firstname: string;
        middlename?: string;
        lastname: string;
        email: string;
    };
    action: string;
    reason: string;
    productId: {
        name: string;
    };
    createdAt: string;
}

export default function ProductsList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [products, setProducts] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
    const [archiveReason, setArchiveReason] = useState("");
    const [isRestoreOpen, setIsRestoreOpen] = useState(false);
    const [restoreProductId, setRestoreProductId] = useState<string | null>(null);
    const [restoreReason, setRestoreReason] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [logs, setLogs] = useState<LogType[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [logsSortField, setLogsSortField] = useState<string>('createdAt');
    const [logsSortDirection, setLogsSortDirection] = useState<'asc' | 'desc'>('desc');
    const [logsCurrentPage, setLogsCurrentPage] = useState(1);
    const logsPerPage = 10;

    useEffect(() => {
        const getProducts = async () => {
            setLoading(true);
            try {
                const response = showArchived ? await fetchArchivedProducts() : await fetchProducts();
                console.log("API Response:", response);

                if (response.success) {
                    const productData = response.products.data || response.products;
                    if (Array.isArray(productData)) {
                        setProducts(productData);
                        console.log("Products:", productData);
                    } else {
                        setError("Unexpected data format received");
                    }
                } else {
                    setError(response.message || "Failed to fetch products");
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("An error occurred while fetching products");
            } finally {
                setLoading(false);
            }
        };

        getProducts();
    }, [showArchived]);

    useEffect(() => {
        const getLogs = async () => {
            try {
                const response = await fetchLogs();
                if (response.success) {
                    setLogs(response.logs.data || response.logs);
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        };

        if (showLogs) {
            getLogs();
        }
    }, [showLogs]);

    // Success Modals
    const [isAddSuccessOpen, setIsAddSuccessOpen] = useState<boolean>(false);
    const [isEditSuccessOpen, setIsEditSuccessOpen] = useState<boolean>(false);
    const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState<boolean>(false);
    const [isRestoreSuccessOpen, setIsRestoreSuccessOpen] = useState<boolean>(false);
    // Failed Modal
    const [isFailedOpen, setIsFailedOpen] = useState<boolean>(false);

    // Add Modal
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    // Edit Modal
    const handleOpenEditModal = (product: any) => {
        // Ensure the product data has the correct structure
        const formattedProduct = {
            ...product,
            type: Array.isArray(product.type) ? product.type : [product.type].filter(Boolean),
            size: Array.isArray(product.size) ? product.size : [product.size].filter(Boolean),
            image: Array.isArray(product.image) ? product.image : [product.image].filter(Boolean)
        };
        setSelectedProduct(formattedProduct);
        setIsEditOpen(true);
    };
    const handleCloseEditModal = () => {
        setSelectedProduct(null);
        setIsEditOpen(false);
    };
    // Delete Confirmation Modal
    const handleOpenDeleteModal = (id: string) => {
        setDeleteProductId(id);
        setArchiveReason(""); // Reset reason when opening modal
        setIsDeleteOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setDeleteProductId(null);
        setArchiveReason(""); // Reset reason when closing modal
        setIsDeleteOpen(false);
    };

    const handleOpenRestoreModal = (id: string) => {
        setRestoreProductId(id);
        setRestoreReason(""); // Reset reason when opening modal
        setIsRestoreOpen(true);
    };

    const handleCloseRestoreModal = () => {
        setRestoreProductId(null);
        setRestoreReason(""); // Reset reason when closing modal
        setIsRestoreOpen(false);
    };


    const handleProductAdded = async () => {
        try {
            setLoading(true);
            // Fetch the updated product list
            const response = await fetchAdminProducts();

            if (response.success) {
                // Update the products state
                setProducts(response.products.data);
                // Close the add product modal
                setIsModalOpen(false);
                // Show the success modal
                setIsAddSuccessOpen(true);
            } else {
                setError(response.message);
                setIsFailedOpen(true);
            }
        } catch (error: any) {
            console.error("Error fetching products:", error);
            setError(error.message || "Failed to fetch products");
            setIsFailedOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleProductUpdated = async () => {
        try {
            // Close the edit modal first
            setIsEditOpen(false);
            setSelectedProduct(null);

            // Start loading state
            setLoading(true);

            // Fetch the updated product list
            const response = await fetchAdminProducts();

            if (response.success) {
                // Update the products state with the fresh data
                setProducts(response.products.data);
                // Show success message
                setIsEditSuccessOpen(true);
            } else {
                setError(response.message || 'Failed to fetch updated products');
                setIsFailedOpen(true);
            }
        } catch (error: any) {
            console.error("Error refreshing products after update:", error);
            setError(error.message || "Failed to refresh products");
            setIsFailedOpen(true);
        } finally {
            // Always end loading state
            setLoading(false);
        }
    };

    const handleProductDeletion = async (id: string) => {
        if (!archiveReason) {
            setError("Please provide a reason for archiving the product");
            return;
        }

        try {
            const deleteResponse = await productDeleteAction(id, archiveReason);
            if (deleteResponse.success) {
                setIsDeleteSuccessOpen(true);
                setIsDeleteOpen(false);
                setArchiveReason("");
                // Refresh the product list
                if (showArchived) {
                    const response = await fetchArchivedProducts();
                    if (response.success) {
                        setProducts(response.products.data || response.products || []);
                    }
                } else {
                    const response = await fetchProducts();
                    if (response.success) {
                        setProducts(response.products.data || response.products || []);
                    }
                }
            } else {
                if (deleteResponse.message === "User authentication required" || deleteResponse.message === "Invalid user data") {
                    setError("Your session has expired. Please log in again.");
                } else {
                    setError(deleteResponse.message || "Failed to archive product");
                }
                setIsFailedOpen(true);
            }
        } catch (error: any) {
            console.error("Archive error:", error);
            setError(error.response?.data?.message || "An error occurred while archiving the product");
            setIsFailedOpen(true);
        }
    };

    const handleProductRestore = async (id: string) => {
        if (!restoreReason) {
            setError("Please provide a reason for restoring the product");
            return;
        }

        try {
            const restoreResponse = await productRestoreAction(id, restoreReason);
            if (!restoreResponse.success) {
                setError(restoreResponse.message);
                return;
            }

            // Re-fetch products after restoring
            const response = showArchived ? await fetchArchivedProducts() : await fetchProducts();
            if (response.success) {
                setProducts(response.products.data || response.products);
            }

            setIsRestoreOpen(false);
            setRestoreProductId(null);
            setRestoreReason("");
            setIsRestoreSuccessOpen(true);
        } catch (error: any) {
            setError(error.message || "Failed to restore product");
            setIsRestoreOpen(false);
            setIsFailedOpen(true);
        }
    };

    // Ensure products is always an array
    const filteredProducts = Array.isArray(products) ? products : [];

    // Add sorting logic
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let comparison = 0;
        
        switch (sortField) {
            case 'createdAt':
            case 'updatedAt':
                comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
                break;
            case 'price':
                comparison = a.price - b.price;
                break;
            case 'category':
                comparison = a.category.localeCompare(b.category);
                break;
            default:
                comparison = 0;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Update pagination to use sorted products
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleShowArchived = () => {
        setShowLogs(false); // Turn off logs view when showing archived
        setShowArchived(!showArchived);
    };

    const handleShowLogs = () => {
        setShowArchived(false); // Turn off archived view when showing logs
        setShowLogs(!showLogs);
    };

    // Add sorting logic for logs
    const handleLogsSort = (field: string) => {
        if (logsSortField === field) {
            setLogsSortDirection(logsSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setLogsSortField(field);
            setLogsSortDirection('asc');
        }
    };

    const sortedLogs = [...logs].sort((a, b) => {
        let comparison = 0;
        
        switch (logsSortField) {
            case 'createdAt':
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                break;
            case 'action':
                comparison = a.action.localeCompare(b.action);
                break;
            default:
                comparison = 0;
        }

        return logsSortDirection === 'asc' ? comparison : -comparison;
    });

    // Pagination for logs
    const logsIndexOfLastItem = logsCurrentPage * logsPerPage;
    const logsIndexOfFirstItem = logsIndexOfLastItem - logsPerPage;
    const currentLogs = sortedLogs.slice(logsIndexOfFirstItem, logsIndexOfLastItem);
    const logsTotalPages = Math.ceil(sortedLogs.length / logsPerPage);

    const handleLogsPageChange = (pageNumber: number) => {
        setLogsCurrentPage(pageNumber);
    };

    // Print functionality
    const handlePrintLogs = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Product Logs</title>
                        <style>
                            body { font-family: Arial, sans-serif; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f5f5f5; }
                            .header { text-align: center; margin-bottom: 20px; }
                            .timestamp { text-align: right; font-size: 12px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Product Logs Report</h1>
                            <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Product</th>
                                    <th>Reason</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${logs.map(log => `
                                    <tr>
                                        <td>${`${log.user.firstname} ${log.user.middlename ? log.user.middlename + ' ' : ''}${log.user.lastname}`}<br>${log.user.email}</td>
                                        <td>${log.action}</td>
                                        <td>${log.productId.name}</td>
                                        <td>${log.reason}</td>
                                        <td>${new Date(log.createdAt).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <AdminLayout>
            <div className="px-6 py-4">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleShowArchived}
                            className={`flex items-center px-4 py-2 ${showArchived ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-lg transition-colors duration-200`}
                        >
                            {showArchived ? 'Show Active Products' : 'Show Archived Products'}
                        </button>
                        <button
                            type="button"
                            onClick={handleShowLogs}
                            className={`flex items-center px-4 py-2 ${showLogs ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-lg transition-colors duration-200`}
                        >
                            {showLogs ? 'Show Products' : 'Show Logs'}
                        </button>
                        {!showArchived && !showLogs && (
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
                        )}
                    </div>
                </div>

                {/* Stock Legend */}
                {!showArchived && (
                    <div className="bg-white p-3 mb-4 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Stock Level Legend:</h3>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center">
                                <span className="w-4 h-4 inline-block bg-green-100 rounded-full mr-2"></span>
                                <span className="text-xs text-gray-600">Above 100: Sufficient stock</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-4 h-4 inline-block bg-yellow-100 rounded-full mr-2"></span>
                                <span className="text-xs text-gray-600">Below 50: Low stock</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-4 h-4 inline-block bg-red-100 rounded-full mr-2"></span>
                                <span className="text-xs text-gray-600">Below 10: Critical stock</span>
                            </div>
                        </div>
                    </div>
                )}

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
                    ) : showLogs ? (
                        <div>
                            <div className="p-4 flex justify-end">
                                <button
                                    onClick={handlePrintLogs}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print Logs
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead className="bg-gray-50">
                                        <tr className="border-b">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th 
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleLogsSort('action')}
                                            >
                                                <div className="flex items-center">
                                                    Action
                                                    {logsSortField === 'action' && (
                                                        <span className="ml-1">
                                                            {logsSortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Product</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Reason</th>
                                            <th 
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleLogsSort('createdAt')}
                                            >
                                                <div className="flex items-center">
                                                    Date
                                                    {logsSortField === 'createdAt' && (
                                                        <span className="ml-1">
                                                            {logsSortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentLogs.map((log) => (
                                            <tr key={log._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {`${log.user.firstname} ${log.user.middlename ? log.user.middlename + ' ' : ''}${log.user.lastname}`}
                                                    </div>
                                                    <div className="text-sm text-gray-500 hidden md:block">{log.user.email}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        log.action === 'archive' ? 'bg-red-100 text-red-800' :
                                                        log.action === 'restore' ? 'bg-green-100 text-green-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {log.action}
                                                    </span>
                                                    {/* Mobile only view for product */}
                                                    <div className="text-xs text-gray-500 mt-1 md:hidden">
                                                        {log.productId.name}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                                                    {log.productId.name}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 hidden md:table-cell">
                                                    {log.reason}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(log.createdAt).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        hour12: true
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination for Logs */}
                            {logsTotalPages > 1 && (
                                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => handleLogsPageChange(logsCurrentPage - 1)}
                                            disabled={logsCurrentPage === 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handleLogsPageChange(logsCurrentPage + 1)}
                                            disabled={logsCurrentPage === logsTotalPages}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{logsIndexOfFirstItem + 1}</span> to{' '}
                                                <span className="font-medium">
                                                    {Math.min(logsIndexOfLastItem, sortedLogs.length)}
                                                </span>{' '}
                                                of <span className="font-medium">{sortedLogs.length}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                <button
                                                    onClick={() => handleLogsPageChange(logsCurrentPage - 1)}
                                                    disabled={logsCurrentPage === 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="sr-only">Previous</span>
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                {[...Array(logsTotalPages)].map((_, index) => (
                                                    <button
                                                        key={index + 1}
                                                        onClick={() => handleLogsPageChange(index + 1)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            logsCurrentPage === index + 1
                                                                ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => handleLogsPageChange(logsCurrentPage + 1)}
                                                    disabled={logsCurrentPage === logsTotalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="sr-only">Next</span>
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto hidden md:table">
                                    <thead className="bg-gray-50">
                                        <tr className="border-b">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th 
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('createdAt')}
                                            >
                                                <div className="flex items-center">
                                                    Created
                                                    {sortField === 'createdAt' && (
                                                        <span className="ml-1">
                                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th 
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden lg:table-cell"
                                                onClick={() => handleSort('updatedAt')}
                                            >
                                                <div className="flex items-center">
                                                    Updated
                                                    {sortField === 'updatedAt' && (
                                                        <span className="ml-1">
                                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th 
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('price')}
                                            >
                                                <div className="flex items-center">
                                                    Price
                                                    {sortField === 'price' && (
                                                        <span className="ml-1">
                                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                            <th 
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('category')}
                                            >
                                                <div className="flex items-center">
                                                    Category
                                                    {sortField === 'category' && (
                                                        <span className="ml-1">
                                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentItems.length > 0 ? (
                                            currentItems.map((product: any) => (
                                                <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-200">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                <img
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                    src={product.image[0]}
                                                                    alt={product.name}
                                                                />
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {new Date(product.createdAt).toLocaleString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour12: true
                                                            })}
                                                        </div>
                                                    </td>
                                                        
                                                    <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                                                        <div className="text-sm text-gray-900">
                                                            {new Date(product.updatedAt).toLocaleString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour12: true
                                                            })}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">₱{product.price.toFixed(2)}</div>
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.countInStock > 100
                                                            ? 'bg-green-100 text-green-800'
                                                            : product.countInStock >= 10
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {product.countInStock}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isNotArchived
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {product.isNotArchived ? 'Active' : 'Archived'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {product.isNotArchived ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleOpenEditModal(product)}
                                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleOpenDeleteModal(product._id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Archive
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleOpenRestoreModal(product._id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Restore
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                                    <p>{showArchived ? 'No archived products available.' : 'No products available.'}</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Mobile Card View */}
                                <div className="md:hidden">
                                    <div className="flex justify-between items-center py-2 px-4 border-b text-sm text-gray-500">
                                        <span>Page {currentPage} of {totalPages}</span>
                                        <div className="flex gap-2">
                                            <button 
                                                className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
                                                disabled={currentPage === 1}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                            >
                                                Previous
                                            </button>
                                            <button 
                                                className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
                                                disabled={currentPage === totalPages}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {currentItems.length > 0 ? (
                                        currentItems.map((product: any) => (
                                            <div key={product._id} className="border-b last:border-b-0 p-4">
                                                <div className="flex items-center mb-3">
                                                    <div className="h-12 w-12 flex-shrink-0 mr-3">
                                                        <img
                                                            className="h-12 w-12 rounded-full object-cover"
                                                            src={product.image[0]}
                                                            alt={product.name}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-md font-medium text-gray-900">{product.name}</h3>
                                                        <div className="flex mt-1 space-x-2">
                                                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isNotArchived
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {product.isNotArchived ? 'Active' : 'Archived'}
                                                            </span>
                                                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${product.countInStock > 100
                                                                ? 'bg-green-100 text-green-800'
                                                                : product.countInStock >= 10
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                Stock: {product.countInStock}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Price:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">₱{product.price.toFixed(2)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Category:</span>
                                                        <span className="ml-1 text-gray-900">{product.category}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Created:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {new Date(product.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Updated:</span>
                                                        <span className="ml-1 text-gray-900">
                                                            {new Date(product.updatedAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 flex justify-end space-x-2">
                                                    {product.isNotArchived ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenEditModal(product)}
                                                                className="px-3 py-1 rounded bg-blue-50 text-blue-600 text-sm"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenDeleteModal(product._id)}
                                                                className="px-3 py-1 rounded bg-red-50 text-red-600 text-sm"
                                                            >
                                                                Archive
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleOpenRestoreModal(product._id)}
                                                            className="px-3 py-1 rounded bg-green-50 text-green-600 text-sm"
                                                        >
                                                            Restore
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center text-gray-500">
                                            <p>{showArchived ? 'No archived products available.' : 'No products available.'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                                <span className="font-medium">
                                                    {Math.min(indexOfLastItem, sortedProducts.length)}
                                                </span>{' '}
                                                of <span className="font-medium">{sortedProducts.length}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="sr-only">Previous</span>
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                {[...Array(totalPages)].map((_, index) => (
                                                    <button
                                                        key={index + 1}
                                                        onClick={() => handlePageChange(index + 1)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            currentPage === index + 1
                                                                ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="sr-only">Next</span>
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Add Modal */}
                <AddProductModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onProductAdded={handleProductAdded}
                />

                {/* Edit Modal */}
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
                                Archive Product
                            </DialogTitle>
                            <Description className="text-sm text-gray-500 mb-4">
                                Are you sure you want to archive this product? It will no longer be visible to customers.
                            </Description>
                            <div className="mb-4">
                                <label htmlFor="archiveReason" className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for archiving
                                </label>
                                <textarea
                                    id="archiveReason"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    placeholder="Please provide a reason for archiving this product..."
                                    value={archiveReason}
                                    onChange={(e) => setArchiveReason(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={handleCloseDeleteModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleProductDeletion(deleteProductId!)}
                                    disabled={!archiveReason.trim()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Archive
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* Restore Dialog */}
                <Dialog open={isRestoreOpen} onClose={handleCloseRestoreModal} className="relative z-50">
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
                            <DialogTitle className="text-xl font-semibold text-gray-900 mb-4">
                                Restore Product
                            </DialogTitle>
                            <Description className="text-sm text-gray-500 mb-4">
                                Are you sure you want to restore this product? It will be visible to customers again.
                            </Description>
                            <div className="mb-4">
                                <label htmlFor="restoreReason" className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for restoring
                                </label>
                                <textarea
                                    id="restoreReason"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    placeholder="Please provide a reason for restoring this product..."
                                    value={restoreReason}
                                    onChange={(e) => setRestoreReason(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={handleCloseRestoreModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleProductRestore(restoreProductId!)}
                                    disabled={!restoreReason.trim()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Restore
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* Success Modal for Add Product */}
                <Success
                    isOpen={isAddSuccessOpen}
                    gif={
                        <>
                            <img className='mx-auto w-1/3 saturate-200' src="/success.gif" />
                        </>
                    }
                    title="Add successful"
                    message="Your product has been added successfully"
                    buttonText="Got it, thanks!"
                    onConfirm={() => setIsAddSuccessOpen(false)}
                />

                {/* Success Modal for Edit Product */}
                <Success
                    isOpen={isEditSuccessOpen}
                    gif={
                        <>
                            <img className='mx-auto w-1/3 saturate-200' src="/success.gif" />
                        </>
                    }
                    title="Edit successful"
                    message="Your product has been updated successfully"
                    buttonText="Got it, thanks!"
                    onConfirm={() => setIsEditSuccessOpen(false)}
                />

                {/* Success Modal for Delete Product */}
                <Success
                    isOpen={isDeleteSuccessOpen}
                    gif={
                        <>
                            <img className='mx-auto w-1/3 saturate-200' src="/trash.gif" />
                        </>
                    }
                    title="Archive successful"
                    message="Your product has been archived successfully"
                    buttonText="Got it, thanks!"
                    onConfirm={() => setIsDeleteSuccessOpen(false)}
                />

                {/* Failed Modal*/}
                <Failed
                    isOpen={isFailedOpen}
                    title="Oops!"
                    message="There was an issue processing your request. Please try again"
                    buttonText="OK"
                    onConfirm={() => setIsFailedOpen(false)}
                />

                {/* Success Modal for Delete Product */}
                <Success
                    isOpen={isRestoreSuccessOpen}
                    gif={
                        <>
                            <img className='mx-auto w-1/3 saturate-200' src="/trash.gif" />
                        </>
                    }
                    title="Archive successful"
                    message="Your product has been archived successfully"
                    buttonText="Got it, thanks!"
                    onConfirm={() => setIsRestoreSuccessOpen(false)}
                />

            </div>
        </AdminLayout>
    );
}
