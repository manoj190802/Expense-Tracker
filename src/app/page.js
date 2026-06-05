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

// Utilities & Database
import { generateUUID, getCurrentMonthYearStr } from '../utils/helpers';
import { supabase } from '../utils/supabaseClient';

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
  const [isLoaded, setIsLoaded] = useState(false);

  // Mount logic (Load theme from LocalStorage and data from Supabase)
  useEffect(() => {
    setIsMounted(true);
    
    // Load local client theme preference
    const cachedTheme = localStorage.getItem('auraspend_theme');
    if (cachedTheme) {
      setTheme(cachedTheme);
    }

    // Async Fetch from Supabase with LocalStorage Fallback
    async function loadData() {
      let loadedTransactions = [];
      let loadedBudgetLimit = 50000;
      let supabaseSuccess = false;

      try {
        // 1. Fetch transactions from Supabase
        const { data: txs, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });

        if (txError) {
          console.warn("Supabase fetch transactions error, falling back to LocalStorage:", txError.message);
        } else if (txs) {
          loadedTransactions = txs;
          supabaseSuccess = true;
        }

        // 2. Fetch budget limit from Supabase
        const { data: sett, error: settError } = await supabase
          .from('settings')
          .select('*')
          .eq('key', 'budget_limit')
          .single();

        if (settError) {
          if (settError.code !== 'PGRST116') { // PGRST116 is code for "no rows returned"
            console.warn("Supabase fetch budget limit error:", settError.message);
          }
        } else if (sett) {
          loadedBudgetLimit = parseFloat(sett.value);
        }
      } catch (err) {
        console.warn("Unexpected error connecting to Supabase database, falling back to LocalStorage:", err);
      }

      // Check LocalStorage cache values
      const cachedTransactions = localStorage.getItem('auraspend_transactions');
      let localTxs = [];
      if (cachedTransactions) {
        try {
          localTxs = JSON.parse(cachedTransactions);
        } catch (e) {
          console.error("Failed parsing cached transactions", e);
        }
      }

      const cachedBudget = localStorage.getItem('auraspend_budget_limit');
      let localBudgetLimit = 50000;
      if (cachedBudget !== null) {
        localBudgetLimit = parseFloat(cachedBudget);
      }

      // Fallback to local storage if Supabase failed OR if Supabase returned empty but we have local data
      if (!supabaseSuccess || (loadedTransactions.length === 0 && localTxs.length > 0)) {
        loadedTransactions = localTxs;
        loadedBudgetLimit = localBudgetLimit;

        // If Supabase was successful but returned empty database, sync local cache up to remote
        if (supabaseSuccess && localTxs.length > 0) {
          console.log("Syncing local storage data to empty Supabase database...");
          supabase.from('transactions').insert(localTxs).then(({ error }) => {
            if (error) console.warn("Background transactions sync error:", error.message);
          });
          supabase.from('settings').upsert({ key: 'budget_limit', value: localBudgetLimit.toString() }).then(({ error }) => {
            if (error) console.warn("Background settings sync error:", error.message);
          });
        }
      }

      setTransactions(loadedTransactions);
      setBudgetLimit(loadedBudgetLimit);
      setIsLoaded(true); // Set isLoaded to true only after initial load finishes
    }

    loadData();
  }, []);

  // Scroll to top when active view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeView]);

  // Lock background scroll on mobile when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  // Save transactions to LocalStorage only AFTER initial loading is complete
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('auraspend_transactions', JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  // Save budget limit to LocalStorage only AFTER initial loading is complete
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('auraspend_budget_limit', budgetLimit.toString());
    }
  }, [budgetLimit, isLoaded]);

  // Save client-side theme preferences to LocalStorage
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
  const handleFormSubmit = async (txData) => {
    if (txData.id) {
      // Edit mode
      const updatedTx = {
        name: txData.name,
        amount: txData.amount,
        type: txData.type,
        date: txData.date,
        category: txData.category
      };

      // Optimistic update in UI state for responsive feel (saved to local storage automatically by hook effect)
      setTransactions(prev => prev.map(tx => tx.id === txData.id ? { ...tx, ...updatedTx } : tx));
      setEditingTransactionId(null);

      // Save to Supabase in background
      const { error } = await supabase
        .from('transactions')
        .update(updatedTx)
        .eq('id', txData.id);

      if (error) {
        console.warn("Supabase transaction update error (synced to LocalStorage):", error.message);
      }
    } else {
      // Add mode
      const id = generateUUID();
      const newTx = {
        id,
        name: txData.name,
        amount: txData.amount,
        type: txData.type,
        date: txData.date,
        category: txData.category
      };

      // Optimistic update in UI state
      setTransactions(prev => [...prev, newTx]);

      // Save to Supabase in background
      const { error } = await supabase
        .from('transactions')
        .insert([newTx]);

      if (error) {
        console.warn("Supabase transaction insert error (synced to LocalStorage):", error.message);
      }
    }
  };

  const handleEditSelect = (id) => {
    setEditingTransactionId(id);
    setActiveView('dashboard');
  };

  const handleDeleteSelect = async (id) => {
    // Optimistic update in UI state
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    if (editingTransactionId === id) {
      setEditingTransactionId(null);
    }

    // Delete in Supabase in background
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn("Supabase transaction delete error (synced to LocalStorage):", error.message);
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
  const handleLoadMockData = async () => {
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

    // Update UI state immediately
    setTransactions(enrichedMock);
    setBudgetLimit(40000);
    setActiveView('dashboard');

    try {
      // Clear remote database first to prevent mock conflicts
      await supabase.from('transactions').delete().neq('id', '');
      
      const { error: txError } = await supabase.from('transactions').insert(enrichedMock);
      const { error: settError } = await supabase.from('settings').upsert({ key: 'budget_limit', value: '40000' });

      if (txError || settError) {
        console.warn("Supabase mock data write errors:", txError, settError);
        alert("Mock transactions successfully loaded locally.");
      } else {
        alert('Mock transactions successfully loaded and synced to remote database.');
      }
    } catch (err) {
      console.error("Mock data Supabase write fail:", err);
    }
  };

  // Save Budget Configuration
  const handleSaveBudget = async (val) => {
    // Update local state
    setBudgetLimit(val);
    alert('Monthly budget limit configurations updated successfully.');

    // Save to settings table in Supabase
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'budget_limit', value: val.toString() });

    if (error) {
      console.warn("Supabase settings write error (synced locally):", error.message);
    }
  };

  // Wipe Data Settings
  const handleWipeData = async () => {
    // Update local UI states
    setTransactions([]);
    setBudgetLimit(50000);
    setTheme('dark');
    setEditingTransactionId(null);
    setIsWipeModalOpen(false);
    setActiveView('dashboard');
    
    // Clear local theme preference
    localStorage.removeItem('auraspend_theme');

    try {
      // Wipe tables on Supabase
      const { error: txError } = await supabase
        .from('transactions')
        .delete()
        .neq('id', '');
      
      const { error: settError } = await supabase
        .from('settings')
        .upsert({ key: 'budget_limit', value: '50000' });

      if (txError || settError) {
        console.warn("Supabase database wipe errors:", txError, settError);
        alert('All local database records and transaction logs have been wiped successfully.');
      } else {
        alert('All database records and transaction logs have been wiped successfully.');
      }
    } catch (err) {
      console.error("Unexpected error during database wipe:", err);
    }
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
            onSaveBudget={handleSaveBudget}
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
          <span>InEx-tracker Expense Tracker Dashboard &copy; 2026. Made with Google Antigravity.</span>
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
