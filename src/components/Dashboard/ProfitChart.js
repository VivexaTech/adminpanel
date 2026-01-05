import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProfitChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfitData();
  }, []);

  const fetchProfitData = async () => {
    try {
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      const monthlyProfit = {};

      salesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date) {
          const date = data.date.toDate ? data.date.toDate() : new Date(data.date);
          const month = date.toLocaleString('default', { month: 'short' });
          monthlyProfit[month] = (monthlyProfit[month] || 0) + (data.profit || 0);
        }
      });

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const profits = months.map(month => monthlyProfit[month] || 0);

      setChartData({
        labels: months,
        datasets: [
          {
            label: 'Profit',
            data: profits,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching profit data:', error);
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
      {chartData && <Line data={chartData} options={options} />}
    </div>
  );
};

export default ProfitChart;
