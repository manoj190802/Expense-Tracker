export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(value);
};

export const generateUUID = () => {
  return 'tx-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
};

export const getCategoryColorHex = (category) => {
  const colors = {
    Food: '#f97316', // Orange
    Travel: '#06b6d4', // Cyan
    Shopping: '#a855f7', // Purple
    Bills: '#ec4899', // Pink
    Salary: '#10b981', // Emerald Green
    Other: '#64748b' // Slate Grey
  };
  return colors[category] || colors.Other;
};

export const getCurrentMonthYearStr = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${month}`; // Returns "YYYY-MM"
};

export const getLastSixMonths = () => {
  const result = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const tempDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const monthNum = String(tempDate.getMonth() + 1).padStart(2, '0');
    const year = tempDate.getFullYear();
    const monthLabel = tempDate.toLocaleString('default', { month: 'short' });
    result.push({
      key: `${year}-${monthNum}`, // "YYYY-MM"
      label: `${monthLabel} ${String(year).substring(2)}` // "Jan 26"
    });
  }
  return result;
};

export const CATEGORY_ICONS_KEYS = {
  Food: 'Utensils2',
  Travel: 'Plane',
  Shopping: 'ShoppingBag',
  Bills: 'Receipt',
  Salary: 'Banknote',
  Other: 'HelpCircle'
};
