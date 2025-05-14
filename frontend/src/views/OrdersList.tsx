import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { fetchOrders, OrderFilters, processOrders, updateOrderPayment, updateOrderStatus } from "../Actions/Order";
import { Dialog, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function OrdersList() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusUpdateError, setStatusUpdateError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 12;
    
    // Filters
    const [filters, setFilters] = useState<OrderFilters>({
        paymentStatus: 'all',
        deliveryStatus: 'all',
        dateRange: undefined
    });

    // Date range
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    useEffect(() => {
        fetchOrdersList();
    }, []);

    const fetchOrdersList = async () => {
        setLoading(true);
        const response = await fetchOrders();
        setLoading(false);

        if (!response.success) {
            setError(response.message || "Failed to fetch orders");
        } else {
            setOrders(response.orders);
        }
    };

    const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        
        if (start && end) {
            setFilters(prev => ({
                ...prev,
                dateRange: { start, end }
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                dateRange: undefined
            }));
        }
    };

    const handleStatusChange = (type: 'payment' | 'delivery', value: string) => {
        setFilters(prev => ({
            ...prev,
            [type === 'payment' ? 'paymentStatus' : 'deliveryStatus']: value
        }));
    };

    const filteredOrders = processOrders(orders, filters);
    
    // Calculate pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const handleViewDetails = (order: any) => {
        setSelectedOrder(order);
        setIsDetailsOpen(true);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatUserName = (user: any) => {
        if (!user) return 'N/A';
        if (user.name) return user.name;
        if (user.firstname) return `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname}`;
        return user._id ? `User ${user._id.slice(-6).toUpperCase()}` : 'N/A';
    };

    const formatAddress = (shippingAddress: any) => {
        if (!shippingAddress) return 'N/A';
        
        const parts = [];
        if (shippingAddress.address) parts.push(shippingAddress.address);
        if (shippingAddress.city) parts.push(shippingAddress.city);
        if (shippingAddress.postalCode) parts.push(shippingAddress.postalCode);
        if (shippingAddress.country) parts.push(shippingAddress.country);
        
        return parts.join(', ') || 'N/A';
    };

    const getStatusColor = (isPaid: boolean, isDelivered: boolean) => {
        if (!isPaid) return 'bg-red-100 text-red-800';
        if (!isDelivered) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const getStatusText = (isPaid: boolean, isDelivered: boolean) => {
        if (!isPaid) return 'Unpaid';
        if (!isDelivered) return 'Pending Delivery';
        return 'Completed';
    };

    const handleStatusUpdate = async (order: any, field: 'isPaid' | 'isDelivered', value: boolean) => {
        setUpdatingStatus(true);
        setStatusUpdateError("");
        
        const statusType = field === 'isPaid' ? 'payment' : 'delivery';
        const response = await updateOrderStatus(order._id, statusType, value);
        
        setUpdatingStatus(false);
        
        if (!response.success) {
            setStatusUpdateError(response.message || "Failed to update order status");
            return;
        }
        
        // Update the selected order with new values
        setSelectedOrder({
            ...selectedOrder,
            [field]: value,
            ...(field === 'isPaid' && value && { paidAt: new Date().toISOString() }),
            ...(field === 'isDelivered' && value && { deliveredAt: new Date().toISOString() })
        });
        
        // Also update in the orders list
        setOrders(orders.map((o: any) => 
            o._id === order._id ? { 
                ...o, 
                [field]: value,
                ...(field === 'isPaid' && value && { paidAt: new Date().toISOString() }),
                ...(field === 'isDelivered' && value && { deliveredAt: new Date().toISOString() })
            } : o
        ));
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <AdminLayout>
            <div className="px-6 py-4">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Payment Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Status
                            </label>
                            <select
                                value={filters.paymentStatus}
                                onChange={(e) => handleStatusChange('payment', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="all">All</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>

                        {/* Delivery Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Delivery Status
                            </label>
                            <select
                                value={filters.deliveryStatus}
                                onChange={(e) => handleStatusChange('delivery', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="all">All</option>
                                <option value="delivered">Delivered</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Range
                            </label>
                            <DatePicker
                                selectsRange={true}
                                startDate={startDate}
                                endDate={endDate}
                                onChange={handleDateRangeChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholderText="Select date range"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentOrders.length > 0 ? (
                                            currentOrders.map((order: any) => (
                                                <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            #{order._id.slice(-6).toUpperCase()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {formatDate(order.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {formatUserName(order.user)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {order.shippingAddress.city || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            ₱{order.totalPrice.toFixed(2)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            getStatusColor(order.isPaid, order.isDelivered)
                                                        }`}>
                                                            {getStatusText(order.isPaid, order.isDelivered)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleViewDetails(order)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    <p className="mt-2 text-sm">No orders found.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
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
                                                Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                                                <span className="font-medium">
                                                    {Math.min(indexOfLastOrder, filteredOrders.length)}
                                                </span>{' '}
                                                of <span className="font-medium">{filteredOrders.length}</span> results
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
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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

                {/* Order Details Modal */}
                <Dialog open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} className="relative z-50">
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="mx-auto max-w-3xl w-full rounded-lg bg-white p-6 shadow-xl">
                            <DialogTitle className="text-xl font-semibold text-gray-900 mb-4">
                                Order Details
                            </DialogTitle>
                            {selectedOrder && (
                                <div className="space-y-4">
                                    {/* Order Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                                            <p className="mt-1">#{selectedOrder._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Date</h3>
                                            <p className="mt-1">{formatDate(selectedOrder.createdAt)}</p>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="border-t pt-4">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-900">{formatUserName(selectedOrder.user)}</p>
                                                <p className="text-sm text-gray-500">{formatAddress(selectedOrder.shippingAddress)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Payment Method: {selectedOrder.paymentMethod}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Management */}
                                    <div className="border-t pt-4">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Status Management</h3>
                                        
                                        {statusUpdateError && (
                                            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                                                {statusUpdateError}
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Payment Status */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Payment Status
                                                </label>
                                                <select
                                                    value={selectedOrder.isPaid ? "paid" : "unpaid"}
                                                    onChange={(e) => handleStatusUpdate(
                                                        selectedOrder, 
                                                        'isPaid', 
                                                        e.target.value === "paid"
                                                    )}
                                                    disabled={updatingStatus}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                >
                                                    <option value="paid">Paid</option>
                                                    <option value="unpaid">Unpaid</option>
                                                </select>
                                                {selectedOrder.paidAt && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Paid on: {formatDate(selectedOrder.paidAt)}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            {/* Delivery Status */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Delivery Status
                                                </label>
                                                <select
                                                    value={selectedOrder.isDelivered ? "delivered" : "pending"}
                                                    onChange={(e) => handleStatusUpdate(
                                                        selectedOrder, 
                                                        'isDelivered', 
                                                        e.target.value === "delivered"
                                                    )}
                                                    disabled={updatingStatus}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                >
                                                    <option value="delivered">Delivered</option>
                                                    <option value="pending">Pending</option>
                                                </select>
                                                {selectedOrder.deliveredAt && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Delivered on: {formatDate(selectedOrder.deliveredAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {updatingStatus && (
                                            <div className="mt-2 flex justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Items */}
                                    <div className="border-t pt-4">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
                                        <div className="space-y-2">
                                            {selectedOrder.orderItems.map((item: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <img src={item.image} alt={item.name} className="h-10 w-10 rounded object-cover" />
                                                        <div className="ml-4">
                                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                            <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900">₱{item.price}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium text-gray-500">Total</p>
                                            <p className="text-sm font-medium text-gray-900">₱{selectedOrder.totalPrice.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsDetailsOpen(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </DialogPanel>
                    </div>
                </Dialog>
            </div>
        </AdminLayout>
    );
} 
