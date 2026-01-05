import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { uploadToCloudinary } from '../utils/cloudinary';
import CertificateModal from '../components/Certificates/CertificateModal';
import CertificateTable from '../components/Certificates/CertificateTable';
import './Certificates.css';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'intern-certificates'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const certsList = [];
      
      snapshot.forEach((doc) => {
        certsList.push({ id: doc.id, ...doc.data() });
      });
      
      setCertificates(certsList);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCert(null);
    setShowModal(true);
  };

  const handleEdit = (cert) => {
    setEditingCert(cert);
    setShowModal(true);
  };

  const handleSave = async (certData, imageFile, certificateId) => {
    try {
      // Check if certificate ID already exists (only for new certificates)
      if (!editingCert) {
        const certDoc = await getDoc(doc(db, 'intern-certificates', certificateId));
        if (certDoc.exists()) {
          toast.error('Certificate ID already exists. Please use a different ID.');
          return;
        }
      }

      let certImageUrl = certData.certImage;

      // Upload image if new file provided
      if (imageFile) {
        const preset = process.env.REACT_APP_CLOUDINARY_CERTIFICATE_PRESET;
        console.log('Certificate Preset Check:', {
          preset,
          cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
          portfolioPreset: process.env.REACT_APP_CLOUDINARY_PORTFOLIO_PRESET,
          allEnvVars: {
            CERTIFICATE_PRESET: process.env.REACT_APP_CLOUDINARY_CERTIFICATE_PRESET,
            PORTFOLIO_PRESET: process.env.REACT_APP_CLOUDINARY_PORTFOLIO_PRESET,
            CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
          }
        });
        
        if (!preset) {
          toast.error('Cloudinary certificate preset not configured. Please check your .env file and restart the app.');
          console.error('Missing REACT_APP_CLOUDINARY_CERTIFICATE_PRESET in environment variables');
          return;
        }
        toast.info('Uploading certificate image...');
        try {
          certImageUrl = await uploadToCloudinary(imageFile, preset);
        } catch (uploadError) {
          console.error('Certificate upload error:', uploadError);
          toast.error(uploadError.message || 'Failed to upload image. Please check Cloudinary setup.');
          return;
        }
      }

      const dataToSave = {
        ...certData,
        certImage: certImageUrl,
        createdAt: editingCert ? certData.createdAt : new Date(),
      };

      // Use certificateId as document ID
      const docId = editingCert ? editingCert.id : certificateId;
      
      await setDoc(doc(db, 'intern-certificates', docId), dataToSave);
      
      toast.success(
        editingCert
          ? 'Certificate updated successfully'
          : 'Certificate added successfully'
      );
      setShowModal(false);
      fetchCertificates();
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast.error(error.message || 'Failed to save certificate');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'intern-certificates', id));
      toast.success('Certificate deleted successfully');
      fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('Failed to delete certificate');
    }
  };

  return (
    <div className="certificates-page">
      <div className="page-header">
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Certificate
        </button>
      </div>

      <CertificateTable
        certificates={certificates}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <CertificateModal
          certificate={editingCert}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Certificates;
