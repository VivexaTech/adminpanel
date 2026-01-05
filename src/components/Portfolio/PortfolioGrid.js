import React from 'react';
import { FiEdit, FiTrash2, FiExternalLink } from 'react-icons/fi';
import './PortfolioGrid.css';

const PortfolioGrid = ({ portfolio, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="portfolio-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="portfolio-card skeleton">
            <div className="skeleton" style={{ height: '200px', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '20px', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ height: '16px', width: '80%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (portfolio.length === 0) {
    return <p className="no-data">No portfolio items found</p>;
  }

  return (
    <div className="portfolio-grid">
      {portfolio.map((item) => (
        <div key={item.id} className="portfolio-card">
          {item.imageUrl && (
            <div className="portfolio-image">
              <img src={item.imageUrl} alt={item.title} />
            </div>
          )}
          <div className="portfolio-content">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            {item.tags && item.tags.length > 0 && (
              <div className="portfolio-tags">
                {item.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="portfolio-actions">
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn view"
                >
                  <FiExternalLink /> Visit
                </a>
              )}
              <button
                className="action-btn edit"
                onClick={() => onEdit(item)}
              >
                <FiEdit /> Edit
              </button>
              <button
                className="action-btn delete"
                onClick={() => onDelete(item.id)}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioGrid;
