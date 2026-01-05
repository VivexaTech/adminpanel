import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import KPICard from '../components/Dashboard/KPICard';
import RevenueChart from '../components/Dashboard/RevenueChart';
import SalesChart from '../components/Dashboard/SalesChart';
import ProfitChart from '../components/Dashboard/ProfitChart';
import RecentInvoices from '../components/Dashboard/RecentInvoices';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalSales: 0,
    totalProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch clients
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      const totalClients = clientsSnapshot.size;

      // Fetch sales
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      let totalSales = 0;
      let totalProfit = 0;
      
      salesSnapshot.forEach((doc) => {
        const data = doc.data();
        totalSales += data.amount || 0;
        totalProfit += data.profit || 0;
      });

      setStats({
        totalClients,
        totalSales,
        totalProfit,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="kpi-grid">
        <KPICard
          title="Total Clients"
          value={stats.totalClients}
          icon="users"
          color="primary"
          loading={loading}
        />
        <KPICard
          title="Total Sales"
          value={`$${stats.totalSales.toLocaleString()}`}
          icon="dollar"
          color="success"
          loading={loading}
        />
        <KPICard
          title="Total Profit"
          value={`$${stats.totalProfit.toLocaleString()}`}
          icon="trending"
          color="info"
          loading={loading}
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Revenue Distribution</h3>
          <RevenueChart />
        </div>
        <div className="chart-card">
          <h3>Monthly Sales</h3>
          <SalesChart />
        </div>
        <div className="chart-card full-width">
          <h3>Profit Growth</h3>
          <ProfitChart />
        </div>
      </div>

      <div className="recent-section">
        <RecentInvoices />
      </div>
    </div>
  );
};

export default Dashboard;
