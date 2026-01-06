import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../../utils/currency';
import './InvoiceModal.css';

const InvoiceModal = ({ clients, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    services: [{ name: '', quantity: 1, price: 0 }],
    tax: 0,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index][field] = value;
    setFormData({ ...formData, services: newServices });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', quantity: 1, price: 0 }],
    });
  };

  const removeService = (index) => {
    if (formData.services.length > 1) {
      const newServices = formData.services.filter((_, i) => i !== index);
      setFormData({ ...formData, services: newServices });
    }
  };

  const calculateTotal = () => {
    const subtotal = formData.services.reduce(
      (sum, service) => sum + service.quantity * service.price,
      0
    );
    const taxAmount = (subtotal * formData.tax) / 100;
    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientId) {
      alert('Please select a client');
      return;
    }
    const totals = calculateTotal();
    onSave({
      ...formData,
      totalAmount: totals.total,
      tax: totals.taxAmount,
    });
  };

  const totals = calculateTotal();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content invoice-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Invoice</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Client *</label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
          </div>

          <div className="services-section">
            <div className="section-header">
              <label>Services</label>
              <button type="button" className="btn btn-sm" onClick={addService}>
                <FiPlus /> Add Service
              </button>
            </div>
            {formData.services.map((service, index) => (
              <div key={index} className="service-row">
                <input
                  type="text"
                  placeholder="Service name"
                  value={service.name}
                  onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={service.quantity}
                  onChange={(e) => handleServiceChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  min="1"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  required
                />
                <span className="service-total">
                  {formatCurrency(service.quantity * service.price)}
                </span>
                {formData.services.length > 1 && (
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => removeService(index)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Tax (%)</label>
            <input
              type="number"
              name="tax"
              value={formData.tax}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          <div className="invoice-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;
