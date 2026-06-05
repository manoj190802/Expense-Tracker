"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// Subcomponents
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DashboardView from '../components/DashboardView';
import TransactionsView from '../components/TransactionsView';
import AnalyticsView from '../components/AnalyticsView';
import SettingsView from '../components/SettingsView';
import WipeConfirmModal from '../components/WipeConfirmModal';

// Utilities
import { generateUUID, getCurrentMonthYearStr } from '../utils/helpers';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  
  // App States
  const [transactions, setTransactions] = useState([]);
  const [budgetLimit, setBudgetLimit] = useState(50000);
  const [theme, setTheme] = useState('dark');
  const [activeView, setActiveView] = useState('dashboard');
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  
  // Navigation & Modal UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Mount logic (avoiding hydration mismatches)
  useEffect(() => {
    setIsMounted(true);
    
    // Load from LocalStorage
    const cachedTransactions = localStorage.getItem('auraspend_transactions');
    if (cachedTransactions) {
      try {
        setTransactions(JSON.parse(cachedTransactions));
      } catch (e) {
        console.error("Failed parsing transactions", e);
      }
    }

    const cachedBudget = localStorage.getItem('auraspend_budget_limit');
    if (cachedBudget !== null) {
      setBudgetLimit(parseFloat(cachedBudget));
    }

    const cachedTheme = localStorage.getItem('auraspend_theme');
    if (cachedTheme) {
      setTheme(cachedTheme);
    }
  }, []);

  // Save to LocalStorage when states change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('auraspend_transactions', JSON.stringify(transactions));
    }
  }, [transactions, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('auraspend_budget_limit', budgetLimit.toString());
    }
  }, [budgetLimit, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('auraspend_theme', theme);
    }
  }, [theme, isMounted]);

  // Synchronize document body class for styling
  useEffect(() => {
    if (isMounted) {
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  }, [theme, isMounted]);

  // Calculate current month expenses to trigger budget alert banner
  const currentMonthExpenses = useMemo(() => {
    const currentMonthStr = getCurrentMonthYearStr();
    return transactions
      .filter(tx => tx.type === 'expense' && tx.date.startsWith(currentMonthStr))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  // Reset banner dismissal on transactions or budget updates
  useEffect(() => {
    setIsBannerDismissed(false);
  }, [transactions, budgetLimit]);

  // Add/Edit Transaction Handler
  const handleFormSubmit = (txData) => {
    if (txData.id) {
      // Edit mode
      setTransactions(prev => prev.map(tx => tx.id === txData.id ? { ...tx, ...txData } : tx));
      setEditingTransactionId(null);
    } else {
      // Add mode
      const newTx = {
        ...txData,
        id: generateUUID()
      };
      setTransactions(prev => [...prev, newTx]);
    }
  };

  const handleEditSelect = (id) => {
    setEditingTransactionId(id);
    setActiveView('dashboard');
  };

  const handleDeleteSelect = (id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    if (editingTransactionId === id) {
      setEditingTransactionId(null);
    }
  };

  // CSV Exporter
  const handleExportCsv = () => {
    if (transactions.length === 0) {
      alert('There are no transactions to export.');
      return;
    }

    let csvRows = ['ID,Name,Amount,Type,Date,Category'];
    transactions.forEach(tx => {
      const escapedName = `"${tx.name.replace(/"/g, '""')}"`;
      const row = [
        tx.id,
        escapedName,
        tx.amount,
        tx.type,
        tx.date,
        tx.category
      ].join(',');
      csvRows.push(row);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', encodedUri);
    downloadLink.setAttribute('download', `auraspend_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Load Mock Data
  const handleLoadMockData = () => {
    const MOCK_TRANSACTIONS = [
      { id: 'mock1', name: 'Monthly Salary', amount: 80000, type: 'income', date: '', category: 'Salary' },
      { id: 'mock2', name: 'Apartment Rent', amount: 15000, type: 'expense', date: '', category: 'Bills' },
      { id: 'mock3', name: 'Supermarket Groceries', amount: 4500, type: 'expense', date: '', category: 'Food' },
      { id: 'mock4', name: 'Uber Ride To Work', amount: 450, type: 'expense', date: '', category: 'Travel' },
      { id: 'mock5', name: 'Designer Shoes Sale', amount: 5500, type: 'expense', date: '', category: 'Shopping' },
      { id: 'mock6', name: 'Power & Water Utility', amount: 2800, type: 'expense', date: '', category: 'Bills' },
      { id: 'mock7', name: 'Freelance Software Project', amount: 18500, type: 'income', date: '', category: 'Salary' },
      { id: 'mock8', name: 'Weekend Dinner Outing', amount: 2400, type: 'expense', date: '', category: 'Food' },
      { id: 'mock9', name: 'Gym Membership Fee', amount: 1200, type: 'expense', date: '', category: 'Other' },
      { id: 'mock10', name: 'Petrol Fuel Refill', amount: 3500, type: 'expense', date: '', category: 'Travel' }
    ];

    const d = new Date();
    const months = [];
    for (let i = 0; i < 4; i++) {
      const tempDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mStr = String(tempDate.getMonth() + 1).padStart(2, '0');
      months.push(`${tempDate.getFullYear()}-${mStr}`);
    }

    const enrichedMock = MOCK_TRANSACTIONS.map((tx, idx) => {
      const monthStr = months[idx % 3];
      const day = String((idx * 3) + 5).padStart(2, '0');
      return {
        ...tx,
        id: generateUUID(),
        date: `${monthStr}-${day}`
      };
    });

    setTransactions(enrichedMock);
    setBudgetLimit(40000);
    setActiveView('dashboard');
    alert('Mock transactions successfully loaded into application cache.');
  };

  // Wipe Data Settings
  const handleWipeData = () => {
    localStorage.removeItem('auraspend_transactions');
    localStorage.removeItem('auraspend_budget_limit');
    localStorage.removeItem('auraspend_theme');
    
    setTransactions([]);
    setBudgetLimit(50000);
    setTheme('dark');
    setEditingTransactionId(null);
    setIsWipeModalOpen(false);
    setActiveView('dashboard');
    
    alert('All LocalStorage details and records have been deleted.');
  };

  // Views switch
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView 
            transactions={transactions}
            editingTransaction={transactions.find(tx => tx.id === editingTransactionId)}
            onSubmit={handleFormSubmit}
            onCancelEdit={() => setEditingTransactionId(null)}
            onEditSelect={handleEditSelect}
            onDeleteSelect={handleDeleteSelect}
            onViewChange={setActiveView}
            theme={theme}
          />
        );
      case 'transactions':
        return (
          <TransactionsView 
            transactions={transactions}
            onEditSelect={handleEditSelect}
            onDeleteSelect={handleDeleteSelect}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView 
            transactions={transactions}
            theme={theme}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            budgetLimit={budgetLimit}
            onSaveBudget={(val) => {
              setBudgetLimit(val);
              alert('Monthly budget limit configurations updated successfully.');
            }}
            onExportCsv={handleExportCsv}
            onLoadMockData={handleLoadMockData}
            onWipeClick={() => setIsWipeModalOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  // Avoid flash on mount
  if (!isMounted) {
    return (
      <div 
        className="app-container dark-theme" 
        style={{ minHeight: '100vh', background: 'hsl(224, 71%, 3%)' }}
      ></div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        activeView={activeView}
        onViewChange={setActiveView}
        budgetLimit={budgetLimit}
        transactions={transactions}
        theme={theme}
        onThemeToggle={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="main-content">
        <Topbar 
          activeView={activeView}
          onSidebarToggle={() => setIsSidebarOpen(prev => !prev)}
          onExportCsv={handleExportCsv}
        />
        
        <main className="content-body">
          {/* Danger/Warning Alert for Budget */}
          {budgetLimit > 0 && currentMonthExpenses >= budgetLimit && !isBannerDismissed && (
            <div className="alert-container" id="budget-alert-banner">
              <div className="alert-content warning">
                <AlertTriangle className="alert-icon" size={22} />
                <div className="alert-message">
                  <strong>Budget Warning!</strong> You have exceeded your configured budget limit.
                </div>
                <button 
                  className="alert-close-btn" 
                  id="btn-close-alert" 
                  aria-label="Close Alert"
                  onClick={() => setIsBannerDismissed(true)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
          
          {renderActiveView()}
        </main>
        
        <footer className="app-footer">
          <span>AuraSpend Expense Tracker Dashboard &copy; 2026. Made with Google Antigravity.</span>
        </footer>
      </div>

      <WipeConfirmModal 
        isOpen={isWipeModalOpen}
        onClose={() => setIsWipeModalOpen(false)}
        onConfirm={handleWipeData}
      />
    </div>
  );
}
