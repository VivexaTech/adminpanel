import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { uploadToCloudinary } from '../utils/cloudinary';
import PortfolioModal from '../components/Portfolio/PortfolioModal';
import PortfolioGrid from '../components/Portfolio/PortfolioGrid';
import './Portfolio.css';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'portfolio'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const portfolioList = [];
      
      snapshot.forEach((doc) => {
        portfolioList.push({ id: doc.id, ...doc.data() });
      });
      
      setPortfolio(portfolioList);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error('Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = async (portfolioData, imageFile) => {
    try {
      let imageUrl = portfolioData.imageUrl;

      // Upload image if new file provided
      if (imageFile) {
        const preset = process.env.REACT_APP_CLOUDINARY_PORTFOLIO_PRESET;
        if (!preset) {
          toast.error('Cloudinary portfolio preset not configured. Please check your .env file and restart the app.');
          return;
        }
        toast.info('Uploading image...');
        try {
          imageUrl = await uploadToCloudinary(imageFile, preset);
        } catch (uploadError) {
          toast.error(uploadError.message || 'Failed to upload image. Please check Cloudinary setup.');
          return;
        }
      }

      const dataToSave = {
        ...portfolioData,
        imageUrl,
        timestamp: editingItem ? portfolioData.timestamp : new Date(),
      };

      if (editingItem) {
        await updateDoc(doc(db, 'portfolio', editingItem.id), dataToSave);
        toast.success('Portfolio item updated successfully');
      } else {
        await addDoc(collection(db, 'portfolio'), dataToSave);
        toast.success('Portfolio item added successfully');
      }

      setShowModal(false);
      fetchPortfolio();
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast.error(error.message || 'Failed to save portfolio item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'portfolio', id));
      toast.success('Portfolio item deleted successfully');
      fetchPortfolio();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error('Failed to delete portfolio item');
    }
  };

  return (
    <div className="portfolio-page">
      <div className="page-header">
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Portfolio Item
        </button>
      </div>

      <PortfolioGrid
        portfolio={portfolio}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <PortfolioModal
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Portfolio;
