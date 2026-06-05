import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  TrendingUp, 
  TrendingDown, 
  Tag, 
  DollarSign, 
  Calendar, 
  Layers, 
  Plus, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  Inbox, 
  Utensils, 
  Plane, 
  ShoppingBag, 
  Receipt, 
  Banknote, 
  HelpCircle,
  CheckCircle,
  X
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { formatCurrency, getCategoryColorHex, getLastSixMonths } from '../utils/helpers';

const CATEGORY_ICONS = {
  Food: Utensils,
  Travel: Plane,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Salary: Banknote,
  Other: HelpCircle
};

export default function DashboardView({ 
  transactions, 
  editingTransaction, 
  onSubmit, 
  onCancelEdit, 
  onEditSelect, 
  onDeleteSelect, 
  onViewChange,
  theme
}) {
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Food');
  
  // Validation Errors
  const [errors, setErrors] = useState({
    name: false,
    amount: false,
    date: false,
    category: false
  });

  // Chart Refs
  const barChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const doughnutChartInstance = useRef(null);

  // Sync Form on Editing Transaction change
  useEffect(() => {
    if (editingTransaction) {
      setName(editingTransaction.name);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setCategory(editingTransaction.category);
    } else {
      setName('');
      setAmount('');
      setType('expense');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Food');
    }
    setErrors({
      name: false,
      amount: false,
      date: false,
      category: false
    });
  }, [editingTransaction]);

  // Set default date to today when mounting
  useEffect(() => {
    if (!editingTransaction) {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    transactions.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount;
        incomeCount++;
      } else {
        expense += tx.amount;
        expenseCount++;
      }
    });

    return {
      balance: income - expense,
      income,
      expense,
      incomeCount,
      expenseCount
    };
  }, [transactions]);

  // Recent 5 logs sorted by Date (Newest first)
  const recentLogs = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  // Render Charts
  useEffect(() => {
    // 1. Monthly Summary Chart (Bar Chart)
    if (barChartRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }

      const themeConfig = {
        textColor: theme === 'dark' ? '#94a3b8' : '#64748b',
        gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
      };

      const last6 = getLastSixMonths();
      const monthsKeys = last6.map(m => m.key);
      const monthsLabels = last6.map(m => m.label);

      const expensesByMonth = Array(6).fill(0);
      transactions
        .filter(tx => tx.type === 'expense')
        .forEach(tx => {
          const txMonth = tx.date.substring(0, 7);
          const idx = monthsKeys.indexOf(txMonth);
          if (idx !== -1) {
            expensesByMonth[idx] += tx.amount;
          }
        });

      barChartInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: monthsLabels,
          datasets: [{
            label: 'Monthly Spending (₹)',
            data: expensesByMonth,
            backgroundColor: 'rgba(168, 85, 247, 0.65)',
            borderColor: '#a855f7',
            borderWidth: 1.5,
            borderRadius: 8,
            hoverBackgroundColor: '#a855f7'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: themeConfig.textColor, font: { family: 'Outfit' } }
            },
            y: {
              grid: { color: themeConfig.gridColor },
              ticks: { color: themeConfig.textColor, font: { family: 'Outfit' } }
            }
          }
        }
      });
    }

    // 2. Category Distribution Chart (Doughnut Chart)
    if (doughnutChartRef.current) {
      if (doughnutChartInstance.current) {
        doughnutChartInstance.current.destroy();
      }

      const themeConfig = {
        textColor: theme === 'dark' ? '#94a3b8' : '#64748b',
        gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
      };

      const expensesOnly = transactions.filter(tx => tx.type === 'expense');
      const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Other'];
      const categorySums = categories.map(cat => {
        return expensesOnly
          .filter(tx => tx.category === cat)
          .reduce((sum, tx) => sum + tx.amount, 0);
      });

      const totalExp = categorySums.reduce((a, b) => a + b, 0);
      const hasData = totalExp > 0;
      const chartData = hasData ? categorySums : [1, 1, 1, 1, 1];
      const colors = categories.map(c => getCategoryColorHex(c));
      const borderColors = theme === 'dark' ? 'rgba(15, 17, 28, 0.8)' : '#fff';

      doughnutChartInstance.current = new Chart(doughnutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            data: chartData,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: themeConfig.textColor,
                font: { family: 'Outfit', size: 12 },
                boxWidth: 12,
                boxHeight: 12
              }
            },
            tooltip: {
              enabled: hasData,
              callbacks: {
                label: (context) => {
                  const val = hasData ? categorySums[context.dataIndex] : 0;
                  return ` ${context.label}: ${formatCurrency(val)}`;
                }
              }
            }
          },
          cutout: '65%'
        }
      });
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
    };
  }, [transactions, theme]);

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const isNameValid = name.trim().length >= 2;
    const amt = parseFloat(amount);
    const isAmountValid = !isNaN(amt) && amt > 0;
    const isDateValid = !!date;
    const isCategoryValid = !!category;

    setErrors({
      name: !isNameValid,
      amount: !isAmountValid,
      date: !isDateValid,
      category: !isCategoryValid
    });

    if (isNameValid && isAmountValid && isDateValid && isCategoryValid) {
      onSubmit({
        id: editingTransaction ? editingTransaction.id : undefined,
        name: name.trim(),
        amount: amt,
        type,
        date,
        category
      });

      // Clear local states if not editing
      if (!editingTransaction) {
        setName('');
        setAmount('');
        setType('expense');
        setCategory('Food');
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  };

  // Balance render configuration
  const renderBalanceFooter = () => {
    if (stats.balance > 0) {
      return (
        <span className="trend positive">
          <TrendingUp size={14} /> Net Surplus
        </span>
      );
    } else if (stats.balance < 0) {
      return (
        <span className="trend negative">
          <TrendingDown size={14} /> Net Deficit
        </span>
      );
    } else {
      return (
        <span className="trend neutral">Balanced</span>
      );
    }
  };

  return (
    <section id="view-dashboard" className="content-section active">
      {/* Stats Summary Grid */}
      <div className="stats-grid">
        {/* Balance Card */}
        <div className="stat-card glass-card balance">
          <div className="stat-card-header">
            <span className="card-label">Total Balance</span>
            <div className="icon-badge primary">
              <CreditCard size={22} />
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(stats.balance)}</div>
          <div className="stat-card-footer">
            {renderBalanceFooter()}
          </div>
        </div>
        
        {/* Income Card */}
        <div className="stat-card glass-card income">
          <div className="stat-card-header">
            <span className="card-label">Total Income</span>
            <div className="icon-badge success">
              <ArrowUpRight size={22} />
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(stats.income)}</div>
          <div className="stat-card-footer">
            <span className="trend positive">
              {stats.incomeCount} transaction{stats.incomeCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {/* Expense Card */}
        <div className="stat-card glass-card expense">
          <div className="stat-card-header">
            <span className="card-label">Total Expense</span>
            <div className="icon-badge danger">
              <ArrowDownLeft size={22} />
            </div>
          </div>
          <div className="stat-card-value">{formatCurrency(stats.expense)}</div>
          <div className="stat-card-footer">
            <span className="trend negative">
              {stats.expenseCount} transaction{stats.expenseCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section Grid */}
      <div className="dashboard-grid-2col chart-row">
        {/* Monthly Summary Chart */}
        <div className="chart-card glass-card">
          <div className="card-header">
            <h3 className="card-title">Monthly Expense Summary</h3>
            <span className="card-subtitle">Monthly breakdown of outgoings</span>
          </div>
          <div className="chart-wrapper">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>
        
        {/* Category Distribution Chart */}
        <div className="chart-card glass-card">
          <div className="card-header">
            <h3 className="card-title">Expense Category Distribution</h3>
            <span className="card-subtitle">Share of spending per category</span>
          </div>
          <div className="chart-wrapper">
            <canvas ref={doughnutChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Bottom Layout: Form and Table */}
      <div className="dashboard-grid-2col bottom-row">
        {/* Transaction Form Card */}
        <div className="form-card glass-card">
          <div className="card-header">
            <h3 className="card-title">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h3>
            <span className="card-subtitle">
              {editingTransaction 
                ? `Updating transaction logs for: ${editingTransaction.name}` 
                : 'Record a new flow of cash'}
            </span>
          </div>
          
          <form onSubmit={handleSubmit} noValidate>
            {/* Transaction Title */}
            <div className={`form-group ${errors.name ? 'invalid' : ''}`}>
              <label htmlFor="input-name">Transaction Name</label>
              <div className="input-wrapper">
                <Tag size={16} className="input-icon" />
                <input 
                  type="text" 
                  id="input-name" 
                  placeholder="e.g., Target Groceries" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              <span className="error-msg">Please enter a valid transaction name</span>
            </div>
            
            <div className="form-row">
              {/* Transaction Amount */}
              <div className={`form-group ${errors.amount ? 'invalid' : ''}`}>
                <label htmlFor="input-amount">Amount (₹)</label>
                <div className="input-wrapper">
                  <DollarSign size={16} className="input-icon" />
                  <input 
                    type="number" 
                    id="input-amount" 
                    step="0.01" 
                    min="0.01" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required 
                  />
                </div>
                <span className="error-msg">Enter a positive number (&gt; 0)</span>
              </div>
              
              {/* Transaction Type */}
              <div className="form-group">
                <label htmlFor="input-type">Type</label>
                <div className="input-wrapper">
                  <ArrowLeftRight size={16} className="input-icon" />
                  <select 
                    id="input-type" 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              {/* Transaction Date */}
              <div className={`form-group ${errors.date ? 'invalid' : ''}`}>
                <label htmlFor="input-date">Date</label>
                <div className="input-wrapper">
                  <Calendar size={16} className="input-icon" />
                  <input 
                    type="date" 
                    id="input-date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required 
                  />
                </div>
                <span className="error-msg">Please select a valid date</span>
              </div>
              
              {/* Transaction Category */}
              <div className="form-group">
                <label htmlFor="input-category">Category</label>
                <div className="input-wrapper">
                  <Layers size={16} className="input-icon" />
                  <select 
                    id="input-category" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills</option>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="form-actions">
              {editingTransaction && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onCancelEdit}
                >
                  Cancel Edit
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {editingTransaction ? <CheckCircle size={18} /> : <Plus size={18} />}
                <span>{editingTransaction ? 'Save Changes' : 'Add Transaction'}</span>
              </button>
            </div>
          </form>
        </div>
        
        {/* Recent Transactions Table Card */}
        <div className="recent-transactions-card glass-card">
          <div className="card-header space-between">
            <div>
              <h3 className="card-title">Recent Transactions</h3>
              <span className="card-subtitle">Last 5 logs</span>
            </div>
            <button className="btn-text-link" onClick={() => onViewChange('transactions')}>
              <span>View All</span>
              <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="recent-list-container">
            {recentLogs.length === 0 ? (
              <div className="empty-state" id="dashboard-empty-state">
                <Inbox size={40} className="empty-icon" />
                <p className="empty-title">No transactions registered</p>
                <p className="empty-desc">Create your first transaction using the form to populate details.</p>
              </div>
            ) : (
              <ul className="transaction-list" id="dashboard-recent-list">
                {recentLogs.map(tx => {
                  const Icon = CATEGORY_ICONS[tx.category] || HelpCircle;
                  const sign = tx.type === 'income' ? '+' : '-';
                  const amountClass = tx.type === 'income' ? 'income' : 'expense';
                  
                  return (
                    <li className="transaction-item" key={tx.id}>
                      <div className={`item-icon-wrapper cat-${tx.category}`}>
                        <Icon size={18} />
                      </div>
                      <div className="item-details">
                        <span className="item-title">{tx.name}</span>
                        <div className="item-meta">
                          <span className={`item-category-label cat-${tx.category}`}>{tx.category}</span>
                          <span>•</span>
                          <span>{tx.date}</span>
                        </div>
                      </div>
                      <div className="item-amount-wrapper">
                        <span className={`item-amount ${amountClass}`}>
                          {sign}{formatCurrency(tx.amount)}
                        </span>
                        <div className="item-actions">
                          <button 
                            type="button" 
                            className="btn-icon-action edit-action" 
                            title="Edit Transaction"
                            onClick={() => onEditSelect(tx.id)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            type="button" 
                            className="btn-icon-action delete-action" 
                            title="Delete Transaction"
                            onClick={() => onDeleteSelect(tx.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
