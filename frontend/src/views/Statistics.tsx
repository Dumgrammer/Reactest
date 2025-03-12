import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { fetchOrders } from '../Actions/Order';

interface ChartData {
  name: string;
  total: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-green-600 font-bold text-lg">
          ₱{payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">Daily Revenue</p>
      </div>
    );
  }
  return null;
};

export default function Statistics() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageDaily, setAverageDaily] = useState(0);

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const fetchOrdersData = async () => {
    setLoading(true);
    const response = await fetchOrders();
    if (response.success) {
      const dailyMap = new Map<string, number>();
      let total = 0;
      
      response.orders.forEach((order: { createdAt: string; totalPrice: number }) => {
        const date = new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        const existing = dailyMap.get(date) || 0;
        const newTotal = existing + order.totalPrice;
        dailyMap.set(date, newTotal);
        total += order.totalPrice;
      });

      const chartData = Array.from(dailyMap.entries())
        .map(([date, total]) => ({
          name: date,
          total
        }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

      setData(chartData);
      setTotalRevenue(total);
      setAverageDaily(total / (chartData.length || 1));
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-start items-center h-96">
      <div className="animate-pulse text-gray-500">Loading chart data...</div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Revenue Trend</h2>
          <p className="text-sm text-gray-600 mt-1">Daily revenue overview</p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-lg font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Average Daily</p>
            <p className="text-lg font-bold text-gray-900">₱{averageDaily.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fill: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `₱${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorTotal)"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6, fill: '#2563eb' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
