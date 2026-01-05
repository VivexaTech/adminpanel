import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      const monthlySales = {};

      salesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date) {
          const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
          const month = date.toLocaleString('default', { month: 'short' });
          monthlySales[month] = (monthlySales[month] || 0) + (data.amount || 0);
        }
      });

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const sales = months.map(month => monthlySales[month] || 0);

      setChartData({
        labels: months,
        datasets: [
          {
            label: 'Sales',
            data: sales,
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: '#6366f1',
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="chart-skeleton" />;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'var(--light-text)',
        },
        grid: {
          color: 'var(--light-border)',
        },
      },
      x: {
        ticks: {
          color: 'var(--light-text)',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      {chartData && <Bar data={chartData} options={options} />}
    </div>
  );
};

export default SalesChart;
