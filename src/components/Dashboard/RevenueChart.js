import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const RevenueChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      const revenueByService = {};

      salesSnapshot.forEach((doc) => {
        const data = doc.data();
        const service = data.serviceName || 'Other';
        revenueByService[service] = (revenueByService[service] || 0) + (data.amount || 0);
      });

      const labels = Object.keys(revenueByService);
      const values = Object.values(revenueByService);

      if (labels.length === 0) {
        labels.push('No Data');
        values.push(1);
      }

      setChartData({
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              '#6366f1',
              '#8b5cf6',
              '#ec4899',
              '#f59e0b',
              '#10b981',
              '#3b82f6',
              '#ef4444',
            ],
            borderWidth: 0,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
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
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          color: 'var(--light-text)',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      {chartData && <Doughnut data={chartData} options={options} />}
    </div>
  );
};

export default RevenueChart;
