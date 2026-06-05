/**
 * AURASPEND - APPLICATION CORE CONTROLLER
 * Vanilla ES6 JavaScript Implementation with Chart.js Integration
 */

// ==========================================================================
// APPLICATION STATE
// ==========================================================================
const AppState = {
  transactions: [],
  budgetLimit: 50000,
  theme: 'dark',
  activeView: 'dashboard',
  editingTransactionId: null
};

// Available categories and details
const CATEGORY_ICONS = {
  Food: 'utensils-2',
  Travel: 'plane',
  Shopping: 'shopping-bag',
  Bills: 'receipt',
  Salary: 'banknote',
  Other: 'help-circle'
};

// MOCK DATA GENERATION TEMPLATE
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

// CHART INSTANCES
let monthlyChartInstance = null;
let categoryChartInstance = null;
let analyticsCompareChartInstance = null;

// ==========================================================================
// DOM SELECTORS
// ==========================================================================
const DOM = {
  // Navigation & View layout
  navButtons: document.querySelectorAll('.nav-btn'),
  views: document.querySelectorAll('.content-section'),
  viewTitle: document.getElementById('view-title'),
  mobileSidebarToggle: document.getElementById('mobile-sidebar-toggle'),
  sidebar: document.querySelector('.sidebar'),
  
  // Theme Switching
  themeCheckbox: document.getElementById('theme-checkbox'),
  sunIndicator: document.getElementById('sun-indicator'),
  
  // Budget Banner / Widget
  budgetAlertBanner: document.getElementById('budget-alert-banner'),
  btnCloseAlert: document.getElementById('btn-close-alert'),
  widgetBudgetProgress: document.getElementById('widget-budget-progress'),
  widgetBudgetSpent: document.getElementById('widget-budget-spent'),
  widgetBudgetLimit: document.getElementById('widget-budget-limit'),
  
  // Header Actions
  btnExportCsv: document.getElementById('btn-export-csv'),
  
  // Dashboard Cards
  cardTotalBalance: document.getElementById('card-total-balance'),
  cardTotalIncome: document.getElementById('card-total-income'),
  cardTotalExpense: document.getElementById('card-total-expense'),
  cardBalanceTrend: document.getElementById('card-balance-trend'),
  cardIncomeCount: document.getElementById('card-income-count'),
  cardExpenseCount: document.getElementById('card-expense-count'),
  
  // Forms & Inputs
  transactionForm: document.getElementById('transaction-form'),
  editTransactionId: document.getElementById('edit-transaction-id'),
  inputName: document.getElementById('input-name'),
  inputAmount: document.getElementById('input-amount'),
  inputType: document.getElementById('input-type'),
  inputDate: document.getElementById('input-date'),
  inputCategory: document.getElementById('input-category'),
  btnSubmitForm: document.getElementById('btn-submit-form'),
  submitIcon: document.getElementById('submit-icon'),
  submitText: document.getElementById('submit-text'),
  btnCancelEdit: document.getElementById('btn-cancel-edit'),
  formTitle: document.getElementById('form-title'),
  formSubtitle: document.getElementById('form-subtitle'),
  
  // Form Errors
  errName: document.getElementById('err-name'),
  errAmount: document.getElementById('err-amount'),
  errType: document.getElementById('err-type'),
  errDate: document.getElementById('err-date'),
  errCategory: document.getElementById('err-category'),
  
  // Recent Lists
  dashboardRecentList: document.getElementById('dashboard-recent-list'),
  dashboardEmptyState: document.getElementById('dashboard-empty-state'),
  linkShowAllTransactions: document.getElementById('link-show-all-transactions'),
  
  // Transactions Table View Filters
  filterSearch: document.getElementById('filter-search'),
  filterType: document.getElementById('filter-type'),
  filterCategory: document.getElementById('filter-category'),
  filterSort: document.getElementById('filter-sort'),
  fullTransactionsTbody: document.getElementById('full-transactions-tbody'),
  tableEmptyState: document.getElementById('table-empty-state'),
  tablePaginationInfo: document.getElementById('table-pagination-info'),
  
  // Analytics
  categoryInsightsList: document.getElementById('category-insights-list'),
  
  // Settings Form & Buttons
  settingsBudgetForm: document.getElementById('settings-budget-form'),
  settingsBudgetInput: document.getElementById('settings-budget-input'),
  btnSettingsCsvExport: document.getElementById('btn-settings-csv-export'),
  btnLoadMockData: document.getElementById('btn-load-mock-data'),
  btnWipeData: document.getElementById('btn-wipe-data'),
  
  // Modal Confirm Dialog
  modalWipeConfirm: document.getElementById('modal-wipe-confirm'),
  btnModalCancel: document.getElementById('btn-modal-cancel'),
  btnModalConfirm: document.getElementById('btn-modal-confirm')
};

// ==========================================================================
// LOCAL STORAGE MANAGER
// ==========================================================================
const StorageManager = {
  save() {
    localStorage.setItem('auraspend_transactions', JSON.stringify(AppState.transactions));
    localStorage.setItem('auraspend_budget_limit', AppState.budgetLimit.toString());
    localStorage.setItem('auraspend_theme', AppState.theme);
  },
  
  load() {
    const cachedTransactions = localStorage.getItem('auraspend_transactions');
    if (cachedTransactions) {
      AppState.transactions = JSON.parse(cachedTransactions);
    } else {
      AppState.transactions = [];
    }

    const cachedBudget = localStorage.getItem('auraspend_budget_limit');
    if (cachedBudget !== null) {
      AppState.budgetLimit = parseFloat(cachedBudget);
    } else {
      AppState.budgetLimit = 50000; // default initial budget
    }

    const cachedTheme = localStorage.getItem('auraspend_theme');
    if (cachedTheme) {
      AppState.theme = cachedTheme;
    } else {
      AppState.theme = 'dark'; // default theme is dark
    }
  },

  clear() {
    localStorage.removeItem('auraspend_transactions');
    localStorage.removeItem('auraspend_budget_limit');
    localStorage.removeItem('auraspend_theme');
    AppState.transactions = [];
    AppState.budgetLimit = 50000;
    AppState.theme = 'dark';
  }
};

// ==========================================================================
// UTILITY FUNCTIONS & CALCULATIONS
// ==========================================================================
const Utils = {
  formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  },
  
  generateUUID() {
    return 'tx-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
  },
  
  getCategoryColorHex(category) {
    // Return CSS custom colors mapped in hex code for Chart.js rendering
    const isDark = document.body.classList.contains('dark-theme');
    const colors = {
      Food: '#f97316', // Orange
      Travel: '#06b6d4', // Cyan
      Shopping: '#a855f7', // Purple
      Bills: '#ec4899', // Pink
      Salary: '#10b981', // Emerald Green
      Other: '#64748b' // Slate Grey
    };
    return colors[category] || colors.Other;
  },

  getCurrentMonthYearStr() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`; // Returns "YYYY-MM"
  },

  getLastSixMonths() {
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
  }
};

// ==========================================================================
// VIEW CONTROLLER / ROUTER
// ==========================================================================
const ViewController = {
  init() {
    // Navigation Button click triggers
    DOM.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        this.switchView(targetView);
        
        // Hide sidebar on mobile/tablet after clicking navigation links
        if (DOM.sidebar.classList.contains('open')) {
          DOM.sidebar.classList.remove('open');
        }
      });
    });

    // Mobile sidebar hamburger menu toggle
    DOM.mobileSidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.sidebar.classList.toggle('open');
    });

    // Document click to close mobile menu if clicking outside
    document.addEventListener('click', (e) => {
      if (DOM.sidebar.classList.contains('open') && 
          !DOM.sidebar.contains(e.target) && 
          e.target !== DOM.mobileSidebarToggle) {
        DOM.sidebar.classList.remove('open');
      }
    });

    // Recent view all link redirect helper
    DOM.linkShowAllTransactions.addEventListener('click', () => {
      this.switchView('transactions');
    });
  },

  switchView(viewName) {
    AppState.activeView = viewName;
    
    // Manage section visibility
    DOM.views.forEach(section => {
      if (section.id === `view-${viewName}`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Manage nav button active styling
    DOM.navButtons.forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update main header title
    const viewTitles = {
      dashboard: 'Dashboard',
      transactions: 'All Transactions',
      analytics: 'Financial Analytics',
      settings: 'Settings'
    };
    DOM.viewTitle.innerText = viewTitles[viewName] || 'Dashboard';

    // Core view specific refresh operations
    if (viewName === 'dashboard') {
      DashboardModule.render();
      ChartModule.renderDashboardCharts();
    } else if (viewName === 'transactions') {
      TransactionsListModule.renderTable();
    } else if (viewName === 'analytics') {
      AnalyticsModule.renderInsights();
      ChartModule.renderAnalyticsCharts();
    } else if (viewName === 'settings') {
      SettingsModule.syncForm();
    }
  }
};

// ==========================================================================
// CORE STATE / STATS MODULE
// ==========================================================================
const StatsModule = {
  calculate() {
    let income = 0;
    let expense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    AppState.transactions.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount;
        incomeCount++;
      } else {
        expense += tx.amount;
        expenseCount++;
      }
    });

    const balance = income - expense;

    return {
      balance,
      income,
      expense,
      incomeCount,
      expenseCount
    };
  },

  updateUI() {
    const stats = this.calculate();
    
    DOM.cardTotalBalance.innerText = Utils.formatCurrency(stats.balance);
    DOM.cardTotalIncome.innerText = Utils.formatCurrency(stats.income);
    DOM.cardTotalExpense.innerText = Utils.formatCurrency(stats.expense);

    DOM.cardIncomeCount.innerText = `${stats.incomeCount} transaction${stats.incomeCount !== 1 ? 's' : ''}`;
    DOM.cardExpenseCount.innerText = `${stats.expenseCount} transaction${stats.expenseCount !== 1 ? 's' : ''}`;

    // Balance trends UI adjustments
    if (stats.balance > 0) {
      DOM.cardBalanceTrend.className = 'trend positive';
      DOM.cardBalanceTrend.innerHTML = '<i data-lucide="trending-up"></i> Net Surplus';
    } else if (stats.balance < 0) {
      DOM.cardBalanceTrend.className = 'trend negative';
      DOM.cardBalanceTrend.innerHTML = '<i data-lucide="trending-down"></i> Net Deficit';
    } else {
      DOM.cardBalanceTrend.className = 'trend neutral';
      DOM.cardBalanceTrend.innerText = 'Balanced';
    }

    // Refresh icons inside dynamically colored trend elements
    lucide.createIcons();
    
    // Update budget bar details
    this.updateBudgetWidget();
  },

  updateBudgetWidget() {
    const currentMonthStr = Utils.getCurrentMonthYearStr();
    
    // Sum up expenses of the current month
    const currentMonthExpenses = AppState.transactions
      .filter(tx => tx.type === 'expense' && tx.date.startsWith(currentMonthStr))
      .reduce((sum, tx) => sum + tx.amount, 0);

    DOM.widgetBudgetSpent.innerText = Utils.formatCurrency(currentMonthExpenses);
    
    if (AppState.budgetLimit > 0) {
      DOM.widgetBudgetLimit.innerText = `/ ${Utils.formatCurrency(AppState.budgetLimit)}`;
      
      const pct = Math.min((currentMonthExpenses / AppState.budgetLimit) * 100, 100);
      DOM.widgetBudgetProgress.style.width = `${pct}%`;

      // Set progress bar fill colors depending on limits reached
      DOM.widgetBudgetProgress.className = 'progress-bar-fill';
      if (pct >= 100) {
        DOM.widgetBudgetProgress.classList.add('danger');
        DOM.budgetAlertBanner.classList.remove('hidden');
      } else if (pct >= 75) {
        DOM.widgetBudgetProgress.classList.add('warning');
        DOM.budgetAlertBanner.classList.add('hidden');
      } else {
        DOM.budgetAlertBanner.classList.add('hidden');
      }
    } else {
      DOM.widgetBudgetLimit.innerText = '/ No Limit';
      DOM.widgetBudgetProgress.style.width = '0%';
      DOM.widgetBudgetProgress.className = 'progress-bar-fill';
      DOM.budgetAlertBanner.classList.add('hidden');
    }
  }
};

// ==========================================================================
// DASHBOARD MODULE (RECENT LISTS & ADD FORM)
// ==========================================================================
const DashboardModule = {
  init() {
    // Set default date input in form to today
    const today = new Date().toISOString().split('T')[0];
    DOM.inputDate.value = today;

    // Form submission event listener
    DOM.transactionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Form edit cancellation button trigger
    DOM.btnCancelEdit.addEventListener('click', () => {
      this.resetFormState();
    });

    // Banner close event helper
    DOM.btnCloseAlert.addEventListener('click', () => {
      DOM.budgetAlertBanner.classList.add('hidden');
    });
  },

  render() {
    StatsModule.updateUI();

    // Fetch and sort transactions by Date (Newest first)
    const sortedList = [...AppState.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = sortedList.slice(0, 5);

    if (recent.length === 0) {
      DOM.dashboardEmptyState.classList.remove('hidden');
      DOM.dashboardRecentList.classList.add('hidden');
    } else {
      DOM.dashboardEmptyState.classList.add('hidden');
      DOM.dashboardRecentList.classList.remove('hidden');

      DOM.dashboardRecentList.innerHTML = recent.map(tx => {
        const sign = tx.type === 'income' ? '+' : '-';
        const cssClass = tx.type === 'income' ? 'income' : 'expense';
        const iconName = CATEGORY_ICONS[tx.category] || 'help-circle';
        
        return `
          <li class="transaction-item">
            <div class="item-icon-wrapper cat-${tx.category}">
              <i data-lucide="${iconName}"></i>
            </div>
            <div class="item-details">
              <span class="item-title">${tx.name}</span>
              <div class="item-meta">
                <span class="item-category-label cat-${tx.category}">${tx.category}</span>
                <span>•</span>
                <span>${tx.date}</span>
              </div>
            </div>
            <div class="item-amount-wrapper">
              <span class="item-amount ${cssClass}">${sign}${Utils.formatCurrency(tx.amount)}</span>
              <div class="item-actions">
                <button type="button" class="btn-icon-action edit-action" data-id="${tx.id}" title="Edit Transaction">
                  <i data-lucide="edit-3"></i>
                </button>
                <button type="button" class="btn-icon-action delete-action" data-id="${tx.id}" title="Delete Transaction">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
          </li>
        `;
      }).join('');

      // Add click listeners to Edit and Delete actions
      DOM.dashboardRecentList.querySelectorAll('.edit-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const txId = btn.getAttribute('data-id');
          this.startEditTransaction(txId);
        });
      });

      DOM.dashboardRecentList.querySelectorAll('.delete-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const txId = btn.getAttribute('data-id');
          this.deleteTransaction(txId);
        });
      });

      lucide.createIcons();
    }
  },

  handleFormSubmit() {
    if (!this.validateForm()) return;

    const name = DOM.inputName.value.trim();
    const amount = parseFloat(DOM.inputAmount.value);
    const type = DOM.inputType.value;
    const date = DOM.inputDate.value;
    const category = DOM.inputCategory.value;
    const id = DOM.editTransactionId.value;

    if (id) {
      // Modify transaction
      const index = AppState.transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        AppState.transactions[index] = { id, name, amount, type, date, category };
      }
      this.resetFormState();
    } else {
      // Add new transaction
      const newTx = {
        id: Utils.generateUUID(),
        name,
        amount,
        type,
        date,
        category
      };
      AppState.transactions.push(newTx);
      this.resetFormState();
    }

    StorageManager.save();
    this.render();
    ChartModule.renderDashboardCharts();
  },

  validateForm() {
    let isValid = true;
    
    // Name validation
    if (DOM.inputName.value.trim().length < 2) {
      DOM.inputName.parentElement.parentElement.classList.add('invalid');
      isValid = false;
    } else {
      DOM.inputName.parentElement.parentElement.classList.remove('invalid');
    }

    // Amount validation
    const amt = parseFloat(DOM.inputAmount.value);
    if (isNaN(amt) || amt <= 0) {
      DOM.inputAmount.parentElement.parentElement.classList.add('invalid');
      isValid = false;
    } else {
      DOM.inputAmount.parentElement.parentElement.classList.remove('invalid');
    }

    // Date validation
    if (!DOM.inputDate.value) {
      DOM.inputDate.parentElement.parentElement.classList.add('invalid');
      isValid = false;
    } else {
      DOM.inputDate.parentElement.parentElement.classList.remove('invalid');
    }

    // Category validation
    if (!DOM.inputCategory.value) {
      DOM.inputCategory.parentElement.parentElement.classList.add('invalid');
      isValid = false;
    } else {
      DOM.inputCategory.parentElement.parentElement.classList.remove('invalid');
    }

    return isValid;
  },

  startEditTransaction(txId) {
    const tx = AppState.transactions.find(t => t.id === txId);
    if (!tx) return;

    // Autofill values in form
    DOM.editTransactionId.value = tx.id;
    DOM.inputName.value = tx.name;
    DOM.inputAmount.value = tx.amount;
    DOM.inputType.value = tx.type;
    DOM.inputDate.value = tx.date;
    DOM.inputCategory.value = tx.category;

    // Style adjustments for edit flow
    DOM.formTitle.innerText = 'Edit Transaction';
    DOM.formSubtitle.innerText = `Updating transaction logs for: ${tx.name}`;
    DOM.submitText.innerText = 'Save Changes';
    DOM.submitIcon.setAttribute('data-id', 'check-circle');
    DOM.btnCancelEdit.classList.remove('hidden');

    lucide.createIcons();

    // Highlight form input focusing
    DOM.inputName.focus();
  },

  resetFormState() {
    DOM.editTransactionId.value = '';
    DOM.inputName.value = '';
    DOM.inputAmount.value = '';
    DOM.inputType.value = 'expense';
    DOM.inputCategory.value = 'Food';
    DOM.inputDate.value = new Date().toISOString().split('T')[0];

    // Reset error layouts
    DOM.inputName.parentElement.parentElement.classList.remove('invalid');
    DOM.inputAmount.parentElement.parentElement.classList.remove('invalid');
    DOM.inputDate.parentElement.parentElement.classList.remove('invalid');
    DOM.inputCategory.parentElement.parentElement.classList.remove('invalid');

    DOM.formTitle.innerText = 'Add Transaction';
    DOM.formSubtitle.innerText = 'Record a new flow of cash';
    DOM.submitText.innerText = 'Add Transaction';
    DOM.submitIcon.setAttribute('data-id', 'plus');
    DOM.btnCancelEdit.classList.add('hidden');

    lucide.createIcons();
  },

  deleteTransaction(txId) {
    AppState.transactions = AppState.transactions.filter(t => t.id !== txId);
    
    // If deleted row was currently editing, clean form fields
    if (DOM.editTransactionId.value === txId) {
      this.resetFormState();
    }
    
    StorageManager.save();
    this.render();
    ChartModule.renderDashboardCharts();
  }
};

// ==========================================================================
// TRANSACTIONS LIST MODULE (SEARCH, FILTER & TABLE VIEW)
// ==========================================================================
const TransactionsListModule = {
  init() {
    const triggerSearch = () => this.renderTable();
    DOM.filterSearch.addEventListener('input', triggerSearch);
    DOM.filterType.addEventListener('change', triggerSearch);
    DOM.filterCategory.addEventListener('change', triggerSearch);
    DOM.filterSort.addEventListener('change', triggerSearch);
  },

  renderTable() {
    const searchVal = DOM.filterSearch.value.trim().toLowerCase();
    const typeVal = DOM.filterType.value;
    const categoryVal = DOM.filterCategory.value;
    const sortVal = DOM.filterSort.value;

    // Apply Filter Chains
    let filtered = AppState.transactions.filter(tx => {
      const matchesSearch = tx.name.toLowerCase().includes(searchVal) || 
                            tx.category.toLowerCase().includes(searchVal);
      const matchesType = typeVal === 'all' ? true : tx.type === typeVal;
      const matchesCategory = categoryVal === 'all' ? true : tx.category === categoryVal;
      
      return matchesSearch && matchesType && matchesCategory;
    });

    // Apply Sort Operations
    filtered.sort((a, b) => {
      if (sortVal === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortVal === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortVal === 'amount-desc') {
        return b.amount - a.amount;
      } else if (sortVal === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    // Handle Render Tables
    if (filtered.length === 0) {
      DOM.fullTransactionsTbody.innerHTML = '';
      DOM.tableEmptyState.classList.remove('hidden');
      DOM.tablePaginationInfo.innerText = 'Showing 0 transactions';
    } else {
      DOM.tableEmptyState.classList.add('hidden');
      
      DOM.fullTransactionsTbody.innerHTML = filtered.map(tx => {
        const sign = tx.type === 'income' ? '+' : '-';
        const cssClass = tx.type === 'income' ? 'income' : 'expense';
        const iconName = CATEGORY_ICONS[tx.category] || 'help-circle';
        
        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 0.8rem; font-weight: 600;">
                <div class="item-icon-wrapper cat-${tx.category}" style="width: 32px; height: 32px; margin: 0; border-radius: 8px;">
                  <i data-lucide="${iconName}" style="width: 14px; height: 14px;"></i>
                </div>
                <span>${tx.name}</span>
              </div>
            </td>
            <td>
              <span class="category-badge cat-${tx.category}">
                <i data-lucide="${iconName}"></i>
                <span>${tx.category}</span>
              </span>
            </td>
            <td>${tx.date}</td>
            <td style="text-transform: capitalize;">${tx.type}</td>
            <td>
              <span class="table-amount ${cssClass}">${sign}${Utils.formatCurrency(tx.amount)}</span>
            </td>
            <td class="text-right">
              <div class="table-actions">
                <button type="button" class="btn-icon-action edit-action" data-id="${tx.id}" title="Edit">
                  <i data-lucide="edit-3"></i>
                </button>
                <button type="button" class="btn-icon-action delete-action" data-id="${tx.id}" title="Delete">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Add Click operations to buttons
      DOM.fullTransactionsTbody.querySelectorAll('.edit-action').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          ViewController.switchView('dashboard');
          DashboardModule.startEditTransaction(id);
        });
      });

      DOM.fullTransactionsTbody.querySelectorAll('.delete-action').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          AppState.transactions = AppState.transactions.filter(t => t.id !== id);
          StorageManager.save();
          this.renderTable();
        });
      });

      DOM.tablePaginationInfo.innerText = `Showing ${filtered.length} of ${AppState.transactions.length} transaction${AppState.transactions.length !== 1 ? 's' : ''}`;
      
      lucide.createIcons();
    }
  }
};

// ==========================================================================
// ANALYTICS MODULE (CATEGORY PIE & INSIGHT BARS)
// ==========================================================================
const AnalyticsModule = {
  renderInsights() {
    // Filter expenses only
    const expensesOnly = AppState.transactions.filter(tx => tx.type === 'expense');
    const totalExpensesSum = expensesOnly.reduce((sum, tx) => sum + tx.amount, 0);

    const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Other'];
    const summary = {};
    categories.forEach(cat => summary[cat] = 0);

    expensesOnly.forEach(tx => {
      if (summary[tx.category] !== undefined) {
        summary[tx.category] += tx.amount;
      } else {
        summary['Other'] += tx.amount;
      }
    });

    // Find absolute maximum single spending category for relative bars percentage
    let maxSpent = 0;
    categories.forEach(cat => {
      if (summary[cat] > maxSpent) maxSpent = summary[cat];
    });

    DOM.categoryInsightsList.innerHTML = categories.map(cat => {
      const spent = summary[cat];
      const percentOfTotal = totalExpensesSum > 0 ? (spent / totalExpensesSum) * 100 : 0;
      // Percent relative to maximum category for visual scale mapping
      const percentOfMax = maxSpent > 0 ? (spent / maxSpent) * 100 : 0;
      const icon = CATEGORY_ICONS[cat] || 'help-circle';
      const color = Utils.getCategoryColorHex(cat);

      return `
        <li class="insight-item">
          <div class="insight-item-header">
            <span class="insight-item-label">
              <i data-lucide="${icon}" style="color: ${color}"></i>
              <span>${cat}</span>
            </span>
            <span class="insight-item-val">${Utils.formatCurrency(spent)} (${percentOfTotal.toFixed(1)}%)</span>
          </div>
          <div class="insight-bar-wrapper">
            <div class="insight-bar-fill" style="width: ${percentOfMax}%; background: ${color}"></div>
          </div>
        </li>
      `;
    }).join('');

    lucide.createIcons();
  }
};

// ==========================================================================
// CHART.JS INTEGRATION MODULE
// ==========================================================================
const ChartModule = {
  getChartThemeConfig() {
    const isDark = document.body.classList.contains('dark-theme');
    return {
      textColor: isDark ? '#94a3b8' : '#64748b',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
    };
  },

  renderDashboardCharts() {
    const theme = this.getChartThemeConfig();
    const last6 = Utils.getLastSixMonths();
    const monthsKeys = last6.map(m => m.key);
    const monthsLabels = last6.map(m => m.label);

    // Sum up expenses per month
    const expensesByMonth = Array(6).fill(0);
    AppState.transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const txMonth = tx.date.substring(0, 7); // Get "YYYY-MM"
        const idx = monthsKeys.indexOf(txMonth);
        if (idx !== -1) {
          expensesByMonth[idx] += tx.amount;
        }
      });

    // 1. MONTHLY SUMMARY CHART (Bar Chart)
    const ctxMonthly = document.getElementById('monthlyChart');
    if (ctxMonthly) {
      if (monthlyChartInstance) {
        monthlyChartInstance.destroy();
      }
      monthlyChartInstance = new Chart(ctxMonthly, {
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
              ticks: { color: theme.textColor, font: { family: 'Outfit' } }
            },
            y: {
              grid: { color: theme.gridColor },
              ticks: { color: theme.textColor, font: { family: 'Outfit' } }
            }
          }
        }
      });
    }

    // 2. CATEGORY DISTRIBUTION CHART (Doughnut)
    const expensesOnly = AppState.transactions.filter(tx => tx.type === 'expense');
    const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Other'];
    const categorySums = categories.map(cat => {
      return expensesOnly
        .filter(tx => tx.category === cat)
        .reduce((sum, tx) => sum + tx.amount, 0);
    });

    const totalExp = categorySums.reduce((a, b) => a + b, 0);

    const ctxCategory = document.getElementById('categoryChart');
    if (ctxCategory) {
      if (categoryChartInstance) {
        categoryChartInstance.destroy();
      }
      
      // If no expenses, render dummy background representation
      const hasData = totalExp > 0;
      const chartData = hasData ? categorySums : [1, 1, 1, 1, 1];
      const colors = categories.map(c => Utils.getCategoryColorHex(c));
      const borderColors = document.body.classList.contains('dark-theme') ? 'rgba(15, 17, 28, 0.8)' : '#fff';

      categoryChartInstance = new Chart(ctxCategory, {
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
                color: theme.textColor,
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
                  return ` ${context.label}: ${Utils.formatCurrency(val)}`;
                }
              }
            }
          },
          cutout: '65%'
        }
      });
    }
  },

  renderAnalyticsCharts() {
    const theme = this.getChartThemeConfig();
    const last6 = Utils.getLastSixMonths();
    const monthsKeys = last6.map(m => m.key);
    const monthsLabels = last6.map(m => m.label);

    const incomes = Array(6).fill(0);
    const expenses = Array(6).fill(0);

    AppState.transactions.forEach(tx => {
      const txMonth = tx.date.substring(0, 7);
      const idx = monthsKeys.indexOf(txMonth);
      if (idx !== -1) {
        if (tx.type === 'income') {
          incomes[idx] += tx.amount;
        } else {
          expenses[idx] += tx.amount;
        }
      }
    });

    const ctxCompare = document.getElementById('analyticsCompareChart');
    if (ctxCompare) {
      if (analyticsCompareChartInstance) {
        analyticsCompareChartInstance.destroy();
      }
      analyticsCompareChartInstance = new Chart(ctxCompare, {
        type: 'line',
        data: {
          labels: monthsLabels,
          datasets: [
            {
              label: 'Inflow (Income)',
              data: incomes,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              borderWidth: 3,
              tension: 0.35,
              fill: true
            },
            {
              label: 'Outflow (Expenses)',
              data: expenses,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderWidth: 3,
              tension: 0.35,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: theme.textColor,
                font: { family: 'Outfit' }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: theme.textColor, font: { family: 'Outfit' } }
            },
            y: {
              grid: { color: theme.gridColor },
              ticks: { color: theme.textColor, font: { family: 'Outfit' } }
            }
          }
        }
      });
    }
  }
};

// ==========================================================================
// SETTINGS & CORE DATA EXPORT MODULE
// ==========================================================================
const SettingsModule = {
  init() {
    DOM.settingsBudgetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBudget();
    });

    // Wipe action overlays
    DOM.btnWipeData.addEventListener('click', () => {
      DOM.modalWipeConfirm.classList.remove('hidden');
    });

    DOM.btnModalCancel.addEventListener('click', () => {
      DOM.modalWipeConfirm.classList.add('hidden');
    });

    // Close modal if clicking overlay
    DOM.modalWipeConfirm.addEventListener('click', (e) => {
      if (e.target === DOM.modalWipeConfirm) {
        DOM.modalWipeConfirm.classList.add('hidden');
      }
    });

    DOM.btnModalConfirm.addEventListener('click', () => {
      this.wipeData();
    });

    // Mock data trigger loading
    DOM.btnLoadMockData.addEventListener('click', () => {
      this.loadMockData();
    });

    // Export buttons mapping
    const handleCsvExport = () => DataExportModule.exportCSV();
    DOM.btnExportCsv.addEventListener('click', handleCsvExport);
    DOM.btnSettingsCsvExport.addEventListener('click', handleCsvExport);
  },

  syncForm() {
    DOM.settingsBudgetInput.value = AppState.budgetLimit || '';
  },

  saveBudget() {
    const val = parseFloat(DOM.settingsBudgetInput.value);
    if (!isNaN(val) && val >= 0) {
      AppState.budgetLimit = val;
      StorageManager.save();
      
      // Update quick widget display elements
      StatsModule.updateBudgetWidget();
      
      // Visual feedback banner toast (we can alert the user)
      alert('Monthly budget limit configurations updated successfully.');
    } else {
      alert('Please enter a valid non-negative number.');
    }
  },

  wipeData() {
    StorageManager.clear();
    StorageManager.save();
    
    // Hide overlay modal
    DOM.modalWipeConfirm.classList.add('hidden');
    
    // Reset inputs
    DashboardModule.resetFormState();
    
    // Re-render UI
    ViewController.switchView('dashboard');
    
    alert('All LocalStorage details and records have been deleted.');
  },

  loadMockData() {
    const currentMonth = Utils.getCurrentMonthYearStr();
    
    // Spread dates over the last few months for charts display consistency
    const d = new Date();
    const months = [];
    for (let i = 0; i < 4; i++) {
      const tempDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mStr = String(tempDate.getMonth() + 1).padStart(2, '0');
      months.push(`${tempDate.getFullYear()}-${mStr}`);
    }

    // Populate dates
    const enrichedMock = MOCK_TRANSACTIONS.map((tx, idx) => {
      // Modulate dates over the last 3 months
      const monthStr = months[idx % 3];
      const day = String((idx * 3) + 5).padStart(2, '0');
      return {
        ...tx,
        id: Utils.generateUUID(),
        date: `${monthStr}-${day}`
      };
    });

    AppState.transactions = enrichedMock;
    AppState.budgetLimit = 40000;
    
    StorageManager.save();
    ViewController.switchView('dashboard');

    alert('Mock transactions successfully loaded into application cache.');
  }
};

// ==========================================================================
// CSV FILE WRITER EXPORTER
// ==========================================================================
const DataExportModule = {
  exportCSV() {
    if (AppState.transactions.length === 0) {
      alert('There are no transactions to export.');
      return;
    }

    // Define CSV header structure
    let csvRows = ['ID,Name,Amount,Type,Date,Category'];

    AppState.transactions.forEach(tx => {
      // Escape name double quotes if needed
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

    // Write file format
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    
    // Trigger download anchor tag sequence
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', encodedUri);
    downloadLink.setAttribute('download', `auraspend_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
};

// ==========================================================================
// DARK / LIGHT THEME TOGGLE CONTROLLER
// ==========================================================================
const ThemeController = {
  init() {
    // Synchronize UI Checkbox with active state theme
    if (AppState.theme === 'dark') {
      document.body.classList.add('dark-theme');
      DOM.themeCheckbox.checked = true;
      this.updateIndicators(true);
    } else {
      document.body.classList.remove('dark-theme');
      DOM.themeCheckbox.checked = false;
      this.updateIndicators(false);
    }

    // Event listener for toggle switch
    DOM.themeCheckbox.addEventListener('change', () => {
      const isChecked = DOM.themeCheckbox.checked;
      if (isChecked) {
        AppState.theme = 'dark';
        document.body.classList.add('dark-theme');
        this.updateIndicators(true);
      } else {
        AppState.theme = 'light';
        document.body.classList.remove('dark-theme');
        this.updateIndicators(false);
      }
      StorageManager.save();
      
      // Refresh Chart renders on theme toggle because color profiles change
      if (AppState.activeView === 'dashboard') {
        ChartModule.renderDashboardCharts();
      } else if (AppState.activeView === 'analytics') {
        ChartModule.renderAnalyticsCharts();
      }
    });
  },

  updateIndicators(isDark) {
    if (isDark) {
      DOM.sunIndicator.setAttribute('data-lucide', 'moon');
    } else {
      DOM.sunIndicator.setAttribute('data-lucide', 'sun');
    }
    lucide.createIcons();
  }
};

// ==========================================================================
// INITIALIZATION ENTRYPOINT
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Load State
  StorageManager.load();

  // Initialize Modules
  ThemeController.init();
  ViewController.init();
  DashboardModule.init();
  TransactionsListModule.init();
  SettingsModule.init();

  // Draw default view data
  ViewController.switchView('dashboard');
});
