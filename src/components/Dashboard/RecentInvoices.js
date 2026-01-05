import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './RecentInvoices.css';

const RecentInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentInvoices();
  }, []);

  const fetchRecentInvoices = async () => {
    try {
      const q = query(
        collection(db, 'invoices'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const invoicesList = [];
      
      snapshot.forEach((doc) => {
        invoicesList.push({ id: doc.id, ...doc.data() });
      });
      
      setInvoices(invoicesList);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="recent-invoices">
        <h3>Recent Invoices</h3>
        <div className="table-skeleton">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton skeleton-cell" />
              <div className="skeleton skeleton-cell" />
              <div className="skeleton skeleton-cell" />
              <div className="skeleton skeleton-cell" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="recent-invoices">
      <h3>Recent Invoices</h3>
      {invoices.length === 0 ? (
        <p className="no-data">No invoices found</p>
      ) : (
        <div className="invoices-table">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.clientId}</td>
                  <td>${invoice.totalAmount?.toLocaleString() || 0}</td>
                  <td>
                    {invoice.createdAt?.toDate
                      ? invoice.createdAt.toDate().toLocaleDateString()
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentInvoices;
