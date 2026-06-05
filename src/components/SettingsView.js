import React, { useState, useEffect } from 'react';
import { PiggyBank, Check, Download, Database, Trash2 } from 'lucide-react';

export default function SettingsView({ 
  budgetLimit, 
  onSaveBudget, 
  onExportCsv, 
  onLoadMockData, 
  onWipeClick 
}) {
  const [localBudget, setLocalBudget] = useState(budgetLimit.toString());

  // Keep form in sync when budget limit changes externally
  useEffect(() => {
    setLocalBudget(budgetLimit.toString());
  }, [budgetLimit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(localBudget);
    if (!isNaN(val) && val >= 0) {
      onSaveBudget(val);
    } else {
      alert('Please enter a valid non-negative number.');
    }
  };

  return (
    <section id="view-settings" className="content-section active">
      <div className="settings-grid">
        
        {/* Budget Config Card */}
        <div className="settings-card glass-card">
          <div className="card-header">
            <h3 className="card-title">Budget Configuration</h3>
            <span className="card-subtitle">Control your monthly outgoings thresholds</span>
          </div>
          
          <form id="settings-budget-form" className="settings-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="settings-budget-input">Monthly Expense Budget (₹)</label>
              <div className="input-wrapper">
                <PiggyBank size={16} className="input-icon" />
                <input 
                  type="number" 
                  id="settings-budget-input" 
                  min="0" 
                  placeholder="e.g., 2000"
                  value={localBudget}
                  onChange={(e) => setLocalBudget(e.target.value)}
                />
              </div>
              <span className="form-hint">
                Set a monthly spending limit to trigger warning notifications. Set to 0 to disable warnings.
              </span>
            </div>
            
            <button type="submit" className="btn btn-primary">
              <Check size={18} />
              <span>Save Budget Configuration</span>
            </button>
          </form>
        </div>
        
        {/* Core App Control Panel Card */}
        <div className="settings-card glass-card">
          <div className="card-header">
            <h3 className="card-title">Data Management</h3>
            <span className="card-subtitle">Manage system memory and database exports</span>
          </div>
          
          <div className="data-settings-actions">
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Export Database</span>
                <span className="setting-desc">
                  Download all transactions as standard comma separated values (CSV) for spreadsheet imports.
                </span>
              </div>
              <button 
                className="btn btn-secondary btn-settings-csv" 
                id="btn-settings-csv-export"
                onClick={onExportCsv}
              >
                <Download size={18} />
                <span>Export (CSV)</span>
              </button>
            </div>
            
            <hr className="setting-divider" />
            
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Import Dummy Data</span>
                <span className="setting-desc">
                  Load standard portfolio mock data to instantly populate charts and transaction lists for testing.
                </span>
              </div>
              <button 
                className="btn btn-secondary" 
                id="btn-load-mock-data"
                onClick={onLoadMockData}
              >
                <Database size={18} />
                <span>Load Mock Data</span>
              </button>
            </div>
            
            <hr className="setting-divider" />
            
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Reset Database</span>
                <span className="setting-desc text-danger">
                  Wipe browser LocalStorage clean and clear all transaction logs permanently.
                </span>
              </div>
              <button 
                className="btn btn-danger" 
                id="btn-wipe-data"
                onClick={onWipeClick}
              >
                <Trash2 size={18} />
                <span>Wipe All Records</span>
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
