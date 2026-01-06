import React from 'react';
import { FiDownload, FiEye } from 'react-icons/fi';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { formatCurrency } from '../../utils/currency';
import './InvoiceTable.css';

const InvoiceTable = ({ invoices, loading, onRefresh }) => {
  const handleDownload = async (invoice) => {
    try {
      await generateInvoicePDF(invoice);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="table-container">
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
    <div className="table-container">
      <div className="table-wrapper">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.clientId}</td>
                  <td>{formatCurrency(invoice.totalAmount || 0)}</td>
                  <td>
                    {invoice.createdAt?.toDate
                      ? invoice.createdAt.toDate().toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        onClick={() => handleDownload(invoice)}
                        title="Download PDF"
                      >
                        <FiDownload />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceTable;
