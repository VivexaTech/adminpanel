import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import ClientModal from '../components/Clients/ClientModal';
import ClientTable from '../components/Clients/ClientTable';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const clientsList = [];
      
      snapshot.forEach((doc) => {
        clientsList.push({ id: doc.id, ...doc.data() });
      });
      
      setClients(clientsList);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleSave = async (clientData) => {
    try {
      if (editingClient) {
        await updateDoc(doc(db, 'clients', editingClient.id), {
          ...clientData,
          updatedAt: new Date(),
        });
        toast.success('Client updated successfully');
      } else {
        await addDoc(collection(db, 'clients'), {
          ...clientData,
          createdAt: new Date(),
        });
        toast.success('Client added successfully');
      }
      setShowModal(false);
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client');
    }
  };

  return (
    <div className="clients-page">
      <div className="page-header">
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Client
        </button>
      </div>

      <ClientTable
        clients={clients}
        loading={loading}
        onEdit={handleEdit}
        onRefresh={fetchClients}
      />

      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Clients;
