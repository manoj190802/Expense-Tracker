import React from 'react';
import { 
  Wallet, 
  Info, 
  Sun, 
  Moon, 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Settings as SettingsIcon 
} from 'lucide-react';
import { formatCurrency, getCurrentMonthYearStr } from '../utils/helpers';

export default function Sidebar({ 
  activeView, 
  onViewChange, 
  budgetLimit, 
  transactions, 
  theme, 
  onThemeToggle, 
  isOpen, 
  onClose 
}) {
  const currentMonthStr = getCurrentMonthYearStr();
  const currentMonthExpenses = transactions
    .filter(tx => tx.type === 'expense' && tx.date.startsWith(currentMonthStr))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const budgetPct = budgetLimit > 0 ? Math.min((currentMonthExpenses / budgetLimit) * 100, 100) : 0;
  
  let progressClass = 'progress-bar-fill';
  if (budgetPct >= 100) {
    progressClass += ' danger';
  } else if (budgetPct >= 75) {
    progressClass += ' warning';
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon-wrapper">
          <Wallet className="logo-icon" />
        </div>
        <span className="logo-text">InEx<span>-tracker</span></span>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <button 
              className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`} 
              onClick={() => { onViewChange('dashboard'); onClose(); }}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-btn ${activeView === 'transactions' ? 'active' : ''}`} 
              onClick={() => { onViewChange('transactions'); onClose(); }}
            >
              <ArrowLeftRight size={20} />
              <span>Transactions</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-btn ${activeView === 'analytics' ? 'active' : ''}`} 
              onClick={() => { onViewChange('analytics'); onClose(); }}
            >
              <PieChart size={20} />
              <span>Analytics</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-btn ${activeView === 'settings' ? 'active' : ''}`} 
              onClick={() => { onViewChange('settings'); onClose(); }}
            >
              <SettingsIcon size={20} />
              <span>Settings</span>
            </button>
          </li>
        </ul>
      </nav>
      
      {/* Budget Quick Widget */}
      <div className="budget-widget glass-card">
        <div className="widget-header">
          <span className="widget-title">Monthly Budget</span>
          <Info 
            size={14} 
            className="widget-info-icon" 
            title="Configure in settings" 
            onClick={() => onViewChange('settings')}
          />
        </div>
        <div className="widget-progress">
          <div className="progress-bar-bg">
            <div className={progressClass} style={{ width: `${budgetPct}%` }}></div>
          </div>
        </div>
        <div className="widget-details">
          <span className="widget-spent">{formatCurrency(currentMonthExpenses)}</span>
          <span className="widget-limit">
            {budgetLimit > 0 ? `/ ${formatCurrency(budgetLimit)}` : '/ No Limit'}
          </span>
        </div>
      </div>
      
      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="theme-toggle-wrapper">
          <span className="theme-label">
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
          <label className="switch-toggle">
            <input 
              type="checkbox" 
              id="theme-checkbox" 
              checked={theme === 'dark'} 
              onChange={onThemeToggle}
            />
            <span className="slider-round"></span>
          </label>
        </div>
      </div>
    </aside>
  );
}
