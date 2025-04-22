import React, { useEffect, useState, useRef } from 'react';
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
  const reportRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = () => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the report');
      return;
    }
    
    // Generate print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Revenue Report - ${today}</title>
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
            <div class="title">Revenue Report</div>
            <div class="date">Generated on ${today}</div>
          </div>
          
          <div class="summary">
            <div class="summary-title">Summary</div>
            <div class="summary-row">
              <span class="summary-label">Total Revenue:</span>
              <span>₱${totalRevenue.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Average Daily Revenue:</span>
              <span>₱${averageDaily.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Date Range:</span>
              <span>${data.length > 0 ? `${data[0].name} - ${data[data.length - 1].name}` : 'No data'}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Number of Days:</span>
              <span>${data.length} days</span>
            </div>
          </div>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
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
    <div className="space-y-6" ref={reportRef}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Revenue Trend</h2>
          <p className="text-sm text-gray-600 mt-1">Daily revenue overview</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-lg font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Average Daily</p>
            <p className="text-lg font-bold text-gray-900">₱{averageDaily.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <button
            onClick={handlePrint}
            className="ml-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
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
