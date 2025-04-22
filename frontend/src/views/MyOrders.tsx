import React, { useState, useEffect } from 'react';
import { fetchUserOrders, fetchUserOrderById } from '../Actions/Order';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layouts';

interface OrderItem {
  _id: string;
  name: string;
  qty: string;
  image: string;
  price: string;
  product: string;
}

interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewingDetails, setViewingDetails] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const result = await fetchUserOrders();
        if (result.success) {
          setOrders(result.orders);
        } else {
          setError(result.message || 'Failed to load orders');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const viewOrderDetails = async (orderId: string) => {
    setLoading(true);
    try {
      const result = await fetchUserOrderById(orderId);
      if (result.success) {
        setSelectedOrder(result.order);
        setViewingDetails(true);
      } else {
        setError(result.message || 'Failed to load order details');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (isPaid: boolean, isDelivered: boolean) => {
    if (!isPaid) {
      return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Awaiting Payment</span>;
    } else if (!isDelivered) {
      return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Paid, Processing</span>;
    } else {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>;
    }
  };

  const backToOrders = () => {
    setViewingDetails(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (viewingDetails && selectedOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <button
            onClick={backToOrders}
            className="text-green-500 hover:text-green-700 font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to My Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-500 text-white px-6 py-4">
            <h2 className="text-xl font-bold">Order Details</h2>
            <p className="text-sm">Order #{selectedOrder._id}</p>
            <p className="text-sm">Placed on {formatDate(selectedOrder.createdAt)}</p>
          </div>

          <div className="p-4 md:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Order Status</h3>
              <div className="flex flex-wrap items-center">
                {getStatusBadge(selectedOrder.isPaid, selectedOrder.isDelivered)}
                {selectedOrder.isPaid && (
                  <span className="ml-2 mt-1 md:mt-0 text-sm text-gray-600">
                    Paid on {formatDate(selectedOrder.paidAt || '')}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Order Items</h3>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.orderItems.map((item) => (
                      <tr key={item._id}>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover" src={item.image} alt={item.name} />
                            </div>
                            <div className="ml-3 md:ml-4">
                              <div className="text-xs md:text-sm font-medium text-gray-900">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">{item.qty}</td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">₱{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Payment Information</h3>
              <p className="text-gray-700">Method: {selectedOrder.paymentMethod === 'pickup' ? 'Cash on Pickup' : selectedOrder.paymentMethod.toUpperCase()}</p>
              <div className="mt-4 text-right">
                <p className="text-lg font-bold">Total: ₱{selectedOrder.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-700 mb-4">You haven't placed any orders yet.</p>
            <Link to="/" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">{order._id.substring(0, 8)}...</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">₱{order.totalPrice.toFixed(2)}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {getStatusBadge(order.isPaid, order.isDelivered)}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium">
                        <button
                          onClick={() => viewOrderDetails(order._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrders; 