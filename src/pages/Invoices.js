import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import InvoiceModal from '../components/Invoices/InvoiceModal';
import InvoiceTable from '../components/Invoices/InvoiceTable';
import './Invoices.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const invoicesList = [];
      
      snapshot.forEach((doc) => {
        invoicesList.push({ id: doc.id, ...doc.data() });
      });
      
      setInvoices(invoicesList);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'clients'));
      const clientsList = [];
      snapshot.forEach((doc) => {
        clientsList.push({ id: doc.id, ...doc.data() });
      });
      setClients(clientsList);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleSave = async (invoiceData) => {
    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      await addDoc(collection(db, 'invoices'), {
        ...invoiceData,
        invoiceNumber,
        createdAt: new Date(),
      });
      
      toast.success('Invoice created successfully');
      setShowModal(false);
      fetchInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    }
  };

  return (
    <div className="invoices-page">
      <div className="page-header">
        <button className="btn btn-primary" onClick={handleAdd}>
          + Create Invoice
        </button>
      </div>

      <InvoiceTable
        invoices={invoices}
        loading={loading}
        onRefresh={fetchInvoices}
      />

      {showModal && (
        <InvoiceModal
          clients={clients}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Invoices;
