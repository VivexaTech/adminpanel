import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import './CertificateTable.css';

const CertificateTable = ({ certificates, loading, onEdit, onDelete }) => {
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
        <table className="certificates-table">
          <thead>
            <tr>
              <th>Certificate ID</th>
              <th>Student Name</th>
              <th>Father Name</th>
              <th>Duration</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No certificates found
                </td>
              </tr>
            ) : (
              certificates.map((cert) => (
                <tr key={cert.id}>
                  <td>
                    <code>{cert.id}</code>
                  </td>
                  <td>{cert.studentName}</td>
                  <td>{cert.fatherName}</td>
                  <td>{cert.duration || 'N/A'}</td>
                  <td>{cert.score || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit(cert)}
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => onDelete(cert.id)}
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

export default CertificateTable;
