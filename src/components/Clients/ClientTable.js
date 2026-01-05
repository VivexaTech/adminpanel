import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import './ClientTable.css';

const ClientTable = ({ clients, loading, onEdit, onRefresh }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      setDeletingId(clientId);
      
      // Check if client has sales
      const salesQuery = query(
        collection(db, 'sales'),
        where('clientId', '==', clientId)
      );
      const salesSnapshot = await getDocs(salesQuery);
      
      if (!salesSnapshot.empty) {
        toast.error('Cannot delete client with existing sales records');
        return;
      }

      await deleteDoc(doc(db, 'clients', clientId));
      toast.success('Client deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewSales = (clientId) => {
    navigate(`/clients/${clientId}/sales`);
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
        <table className="clients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Total Business</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No clients found
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.phone || 'N/A'}</td>
                  <td>{client.company || 'N/A'}</td>
                  <td>${(client.totalBusiness || 0).toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        onClick={() => handleViewSales(client.id)}
                        title="View Sales"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit(client)}
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(client.id)}
                        disabled={deletingId === client.id}
                        title="Delete"
                      >
                        <FiTrash2 />
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

export default ClientTable;
