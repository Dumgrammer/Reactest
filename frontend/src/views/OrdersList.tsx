import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { fetchOrders, OrderFilters, processOrders, updateOrderPayment } from "../Actions/Order";
import { Dialog, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function OrdersList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    
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
            minute: '2-digit'
        });
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
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order: any) => (
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
                                                        {order.user.name || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {order.shippingAddress.city}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        ${order.totalPrice.toFixed(2)}
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
                                                <p className="text-sm text-gray-900">{selectedOrder.user.name}</p>
                                                <p className="text-sm text-gray-500">{selectedOrder.shippingAddress.address}</p>
                                                <p className="text-sm text-gray-500">
                                                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                                                </p>
                                                <p className="text-sm text-gray-500">{selectedOrder.shippingAddress.country}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Payment Method: {selectedOrder.paymentMethod}</p>
                                                <p className="text-sm text-gray-500">
                                                    Payment Status: {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Delivery Status: {selectedOrder.isDelivered ? 'Delivered' : 'Pending'}
                                                </p>
                                            </div>
                                        </div>
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
                                                    <p className="text-sm font-medium text-gray-900">${item.price}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium text-gray-500">Total</p>
                                            <p className="text-sm font-medium text-gray-900">${selectedOrder.totalPrice.toFixed(2)}</p>
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