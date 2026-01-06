import React, { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { formatCurrency } from '../../utils/currency';
import './KPICard.css';

const KPICard = ({ title, value, icon, color, loading }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!loading && value) {
      setIsAnimating(true);
      const numericValue = typeof value === 'string' 
        ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0
        : value;
      
      if (typeof numericValue === 'number' && numericValue > 0) {
        const duration = 1000;
        const steps = 60;
        const increment = numericValue / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= numericValue) {
            setDisplayValue(numericValue);
            clearInterval(timer);
            setIsAnimating(false);
          } else {
            setDisplayValue(Math.floor(current));
          }
        }, duration / steps);
        return () => clearInterval(timer);
      } else {
        setDisplayValue(value);
        setIsAnimating(false);
      }
    }
  }, [value, loading]);

  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <FiUsers />;
      case 'dollar':
        return <FiDollarSign />;
      case 'trending':
        return <FiTrendingUp />;
      default:
        return <FiUsers />;
    }
  };

  const getColorClass = () => {
    return `kpi-card kpi-${color}`;
  };

  if (loading) {
    return (
      <div className={getColorClass()}>
        <div className="kpi-icon skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
        <div className="kpi-content">
          <div className="kpi-title skeleton" style={{ width: '120px', height: '16px', marginBottom: '8px' }} />
          <div className="kpi-value skeleton" style={{ width: '80px', height: '32px' }} />
        </div>
      </div>
    );
  }

  // Check if value is a currency string (contains ₹ or $)
  const isCurrency = typeof value === 'string' && (value.includes('₹') || value.includes('$'));
  const formattedValue = isCurrency
    ? value // Already formatted by formatCurrency utility
    : displayValue.toLocaleString('en-IN');

  return (
    <div className={getColorClass()}>
      <div className="kpi-icon">{getIcon()}</div>
      <div className="kpi-content">
        <h3 className="kpi-title">{title}</h3>
        <p className={`kpi-value ${isAnimating ? 'animating' : ''}`}>
          {formattedValue}
        </p>
      </div>
    </div>
  );
};

export default KPICard;
