import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { fetchOrders, getGcashOrders, getCashOrders } from '../Actions/Order';
import { fetchStocksTotal } from '../Actions/Product';

interface ChartData {
  name: string;
  total: number;
}

interface StocksResponse {
  success: boolean;
  data: {
    totalStocks: number;
  };
  message: string;
}

type TimePeriod = 'day' | 'week' | 'month' | 'year';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-green-600 font-bold text-lg">
          ₱{payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">Revenue</p>
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
  const [totalStocks, setTotalStocks] = useState<number>(0);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('day');
  const [gcashTotal, setGcashTotal] = useState(0);
  const [cashTotal, setCashTotal] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrdersData();
    fetchStocksData();
    fetchPaymentTotals();
  }, [timePeriod]);

  useEffect(() => {
    console.log('Current totalStocks value:', totalStocks);
  }, [totalStocks]);

  const getPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
      case 'day':
        return 'Daily';
      case 'week':
        return 'Weekly';
      case 'month':
        return 'Monthly';
      case 'year':
        return 'Yearly';
      default:
        return 'Custom';
    }
  };

  const formatDate = (date: Date, period: TimePeriod) => {
    switch (period) {
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'year':
        return date.toLocaleDateString('en-US', { year: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getDateKey = (date: Date, period: TimePeriod) => {
    const newDate = new Date(date);
    switch (period) {
      case 'week':
        newDate.setDate(date.getDate() - date.getDay());
        return newDate.toISOString().split('T')[0];
      case 'month':
        newDate.setDate(1);
        return newDate.toISOString().split('T')[0];
      case 'year':
        newDate.setMonth(0, 1);
        return newDate.toISOString().split('T')[0];
      default:
        return date.toISOString().split('T')[0];
    }
  };

  const fetchOrdersData = async () => {
    setLoading(true);
    const response = await fetchOrders();
    if (response.success) {
      const periodMap = new Map<string, number>();
      let total = 0;
      
      response.orders.forEach((order: { createdAt: string; totalPrice: number }) => {
        const date = new Date(order.createdAt);
        const key = getDateKey(date, timePeriod);
        const existing = periodMap.get(key) || 0;
        periodMap.set(key, existing + order.totalPrice);
        total += order.totalPrice;
      });

      const chartData = Array.from(periodMap.entries())
        .map(([key, total]) => ({
          name: formatDate(new Date(key), timePeriod),
          total
        }))
        .sort((a, b) => {
          const dateA = new Date(a.name);
          const dateB = new Date(b.name);
          return dateA.getTime() - dateB.getTime();
        });

      setData(chartData);
      setTotalRevenue(total);
      setAverageDaily(total / (chartData.length || 1));
    }
    setLoading(false);
  };

  const fetchStocksData = async () => {
    try {
      const response = await fetchStocksTotal();
      console.log('Stocks Response:', response);
      if (response.success) {
        const stocks = response.data.totalStocks;
        console.log('Setting stocks to:', stocks);
        setTotalStocks(stocks);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setTotalStocks(0);
    }
  };

  const fetchPaymentTotals = async () => {
    try {
      const [gcashResponse, cashResponse] = await Promise.all([
        getGcashOrders(),
        getCashOrders()
      ]);
      
      if (gcashResponse.success) {
        setGcashTotal(gcashResponse.data.totalPrice);
      }
      if (cashResponse.success) {
        setCashTotal(cashResponse.data.totalPrice);
      }
    } catch (error) {
      console.error('Error fetching payment totals:', error);
    }
  };

  const handlePrint = () => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the report');
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Report - ${today}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .date {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            .summary {
              margin-bottom: 30px;
            }
            .summary-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .summary-label {
              font-weight: bold;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .data-table th {
              background-color: #f3f4f6;
              padding: 8px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #ddd;
            }
            .data-table td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              text-align: center;
              color: #666;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Sales Report - ${getPeriodLabel(timePeriod)} View</div>
            <div class="date">Generated on ${today}</div>
          </div>
          
          <div class="summary">
            <div class="summary-title">Summary</div>
            <div class="summary-row">
              <span class="summary-label">Total Revenue:</span>
              <span>₱${totalRevenue.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Average per ${timePeriod}:</span>
              <span>₱${averageDaily.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">GCash Sales:</span>
              <span>₱${gcashTotal.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Cash on Pickup Sales:</span>
              <span>₱${cashTotal.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total Stocks:</span>
              <span>${totalStocks?.toLocaleString() || '0'} units</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Date Range:</span>
              <span>${data.length > 0 ? `${data[0].name} - ${data[data.length - 1].name}` : 'No data'}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Number of ${timePeriod}s:</span>
              <span>${data.length}</span>
            </div>
          </div>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}</th>
                <th>Revenue (₱)</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>₱${item.total.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>* This report is generated from GC Coop system and is confidential.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (loading) {
    return <div className="flex justify-start items-center h-96">
      <div className="animate-pulse text-gray-500">Loading chart data...</div>
    </div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6" ref={reportRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Revenue Trend</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Revenue overview by {timePeriod}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-6">
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-600">Average per {timePeriod}</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900">₱{averageDaily.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-600">Total Stocks</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900">{totalStocks?.toLocaleString() || '0'} units</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
        </div>
      </div>

      <div className="h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
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
              tick={{ fill: '#4b5563', fontSize: 12 }}
              tickLine={{ stroke: '#4b5563' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#4b5563', fontSize: 12 }}
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
    </div>
  );
}
