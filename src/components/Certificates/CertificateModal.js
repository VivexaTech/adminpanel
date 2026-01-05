import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './CertificateModal.css';

const CertificateModal = ({ certificate, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    certificateId: '',
    studentName: '',
    fatherName: '',
    duration: '',
    startDate: '',
    endDate: '',
    score: '',
    certImage: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (certificate) {
      setFormData({
        certificateId: certificate.id || '',
        studentName: certificate.studentName || '',
        fatherName: certificate.fatherName || '',
        duration: certificate.duration || '',
        startDate: certificate.startDate || '',
        endDate: certificate.endDate || '',
        score: certificate.score || '',
        certImage: certificate.certImage || '',
      });
      setImagePreview(certificate.certImage || '');
    }
  }, [certificate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!certificate && !formData.certificateId) {
      alert('Please enter Certificate ID');
      return;
    }
    
    if (!formData.studentName || !formData.fatherName) {
      alert('Please fill in required fields');
      return;
    }

    const certificateId = certificate ? certificate.id : formData.certificateId;
    onSave(formData, imageFile, certificateId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content certificate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{certificate ? 'Edit Certificate' : 'Add Certificate'}</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {!certificate && (
            <div className="form-group">
              <label>Certificate ID *</label>
              <input
                type="text"
                name="certificateId"
                value={formData.certificateId}
                onChange={handleChange}
                required
                placeholder="Enter unique certificate ID"
              />
              <small className="form-help">
                This ID will be used for public verification. Must be unique.
              </small>
            </div>
          )}
          <div className="form-group">
            <label>Student Name *</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Father Name *</label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 3 months"
              />
            </div>
            <div className="form-group">
              <label>Score</label>
              <input
                type="text"
                name="score"
                value={formData.score}
                onChange={handleChange}
                placeholder="e.g., 95%"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Certificate Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Certificate Preview" />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {certificate ? 'Update' : 'Add'} Certificate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificateModal;
