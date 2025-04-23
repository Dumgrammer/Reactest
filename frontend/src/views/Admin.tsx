import { useEffect, useState } from "react";
import Card from "../components/Card";
import AdminLayout from "../Layout/AdminLayout";
import Statistics from "./Statistics";
import { fetchOrders } from "../Actions/Order";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface StatCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    description: string;
    color: string;
    percentage?: string;
}

const StatCard = ({ title, value, subValue, description, color, percentage }: StatCardProps) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${color}`}>
        <div className="relative z-10">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <div className="mt-2 flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-white">{value}</h3>
                {subValue && <span className="text-sm text-white/70">({subValue})</span>}
            </div>
            {percentage && (
                <p className="mt-1 text-sm font-medium text-white/90">{percentage}</p>
            )}
            <p className="mt-1 text-sm text-white/70">{description}</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-full">
            <svg className="h-full w-full text-white/5" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 C40,40 60,40 100,0 L100,100 L0,100 Z" fill="currentColor" />
            </svg>
        </div>
    </div>
);

const COLORS = ['#10b981', '#3b82f6'];

export default function Admin() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderData();
    }, []);

    const fetchOrderData = async () => {
        const response = await fetchOrders();
        if (response.success) {
            setOrders(response.orders);
        }
        setLoading(false);
    };

    const getTotalRevenue = () => {
        return orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2);
    };

    const getCompletedOrders = () => {
        return orders.filter(order => order.isPaid && order.isDelivered).length;
    };

    const getPendingOrders = () => {
        return orders.filter(order => !order.isDelivered).length;
    };

    const getUnpaidOrders = () => {
        return orders.filter(order => !order.isPaid).length;
    };

    const calculatePercentage = (value: number) => {
        if (orders.length === 0) return "0%";
        return `${((value / orders.length) * 100).toFixed(1)}%`;
    };

    // Payment method distribution data
    const getPaymentMethodData = () => {
        const cashOnPickup = orders.filter(order => order.paymentMethod === 'Cash on Pickup').length;
        const gcash = orders.filter(order => order.paymentMethod === 'GCash').length;

        return [
            { name: 'Cash on Pickup', value: cashOnPickup },
            { name: 'GCash', value: gcash }
        ];
    };

    return (
        <AdminLayout>
            <div className="px-6 py-4 space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Sales Distribution</h2>
                <p className="text-sm text-gray-600">This is all over Platform Sales Generated</p>
                
                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Sales"
                        value={`₱${loading ? "..." : getTotalRevenue()}`}
                        description="Overall Revenue"
                        color="from-blue-600 to-blue-400"
                    />
                    <StatCard
                        title="Completed Orders"
                        value={loading ? "..." : getCompletedOrders()}
                        percentage={loading ? "..." : calculatePercentage(getCompletedOrders())}
                        description="Successfully Delivered"
                        color="from-green-600 to-green-400"
                    />
                    <StatCard
                        title="Pending Orders"
                        value={loading ? "..." : getPendingOrders()}
                        percentage={loading ? "..." : calculatePercentage(getPendingOrders())}
                        description="Awaiting Delivery"
                        color="from-yellow-600 to-yellow-400"
                    />
                    <StatCard
                        title="Unpaid Orders"
                        value={loading ? "..." : getUnpaidOrders()}
                        percentage={loading ? "..." : calculatePercentage(getUnpaidOrders())}
                        description="Payment Pending"
                        color="from-red-600 to-red-400"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Payment Methods */}
                    {/* <Card>
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Payment Methods</h3>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={getPaymentMethodData()}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {getPaymentMethodData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-4">
                                {getPaymentMethodData().map((entry, index) => (
                                    <div key={entry.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                                 style={{ backgroundColor: `${COLORS[index]}20`, color: COLORS[index] }}>
                                                <i className={`fas ${index === 0 ? 'fa-money-bill' : 'fa-mobile-alt'} text-lg`}></i>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">{entry.name}</p>
                                                <p className="text-xs text-gray-500">{entry.value} orders</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            ₱{orders.filter(o => o.paymentMethod === entry.name)
                                                .reduce((sum, order) => sum + order.totalPrice, 0)
                                                .toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card> */}

                    {/* Revenue Trend */}
                    <Card className="lg:col-span-2">
                        <div className="p-4">
                            <Statistics />
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}