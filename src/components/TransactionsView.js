import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Edit3, 
  Trash2, 
  SearchCode, 
  Utensils, 
  Plane, 
  ShoppingBag, 
  Receipt, 
  Banknote, 
  HelpCircle 
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const CATEGORY_ICONS = {
  Food: Utensils,
  Travel: Plane,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Salary: Banknote,
  Other: HelpCircle
};

export default function TransactionsView({ transactions, onEditSelect, onDeleteSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortOption, setSortOption] = useState('date-desc');

  // Filter & Sort Chain
  const filtered = useMemo(() => {
    let result = transactions.filter(tx => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = tx.name.toLowerCase().includes(query) || 
                            tx.category.toLowerCase().includes(query);
      const matchesType = filterType === 'all' ? true : tx.type === filterType;
      const matchesCategory = filterCategory === 'all' ? true : tx.category === filterCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortOption === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortOption === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortOption === 'amount-desc') {
        return b.amount - a.amount;
      } else if (sortOption === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [transactions, searchQuery, filterType, filterCategory, sortOption]);

  return (
    <section id="view-transactions" className="content-section active">
      {/* Filters Toolbar */}
      <div className="toolbar-card glass-card">
        <div className="toolbar-search">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            id="filter-search" 
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="toolbar-filters">
          <div className="filter-group">
            <label htmlFor="filter-type">Type</label>
            <select 
              id="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="filter-category">Category</label>
            <select 
              id="filter-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Salary">Salary</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="filter-sort">Sort By</label>
            <select 
              id="filter-sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="amount-desc">Amount: Highest First</option>
              <option value="amount-asc">Amount: Lowest First</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Main Table List */}
      <div className="table-card glass-card">
        <div className="table-container">
          {filtered.length === 0 ? (
            <div className="empty-state" id="table-empty-state">
              <SearchCode className="empty-icon" size={40} />
              <p className="empty-title">No matching transactions found</p>
              <p className="empty-desc">Refine your search or clear filters to locate results.</p>
            </div>
          ) : (
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Transaction Name</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="full-transactions-tbody">
                {filtered.map(tx => {
                  const Icon = CATEGORY_ICONS[tx.category] || HelpCircle;
                  const sign = tx.type === 'income' ? '+' : '-';
                  const amountClass = tx.type === 'income' ? 'income' : 'expense';

                  return (
                    <tr key={tx.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 600 }}>
                          <div 
                            className={`item-icon-wrapper cat-${tx.category}`}
                            style={{ width: '32px', height: '32px', margin: 0, borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                          >
                            <Icon size={14} />
                          </div>
                          <span>{tx.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`category-badge cat-${tx.category}`}>
                          <Icon size={12} style={{ marginRight: '4px' }} />
                          <span>{tx.category}</span>
                        </span>
                      </td>
                      <td>{tx.date}</td>
                      <td style={{ textTransform: 'capitalize' }}>{tx.type}</td>
                      <td>
                        <span className={`table-amount ${amountClass}`}>
                          {sign}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="table-actions">
                          <button 
                            type="button" 
                            className="btn-icon-action edit-action" 
                            title="Edit"
                            onClick={() => onEditSelect(tx.id)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            type="button" 
                            className="btn-icon-action delete-action" 
                            title="Delete"
                            onClick={() => onDeleteSelect(tx.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="table-footer">
          <span className="pagination-info" id="table-pagination-info">
            Showing {filtered.length} of {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </section>
  );
}
