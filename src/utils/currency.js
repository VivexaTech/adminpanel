/**
 * Format currency in Indian Rupees format
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., ₹1,00,000)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return '₹0';
  }

  // Convert to number if string
  const numAmount = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[^0-9.]/g, '')) || 0
    : amount;

  // Format with Indian number system (lakhs, crores)
  return `₹${numAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
};

/**
 * Format currency without symbol (just the number)
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted number string (e.g., 1,00,000)
 */
export const formatAmount = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return '0';
  }

  const numAmount = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[^0-9.]/g, '')) || 0
    : amount;

  return numAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};
