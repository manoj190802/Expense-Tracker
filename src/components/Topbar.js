import React from 'react';
import { Menu, Download } from 'lucide-react';

export default function Topbar({ activeView, onSidebarToggle, onExportCsv }) {
  const viewTitles = {
    dashboard: 'Dashboard',
    transactions: 'All Transactions',
    analytics: 'Financial Analytics',
    settings: 'Settings'
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="sidebar-menu-btn" 
          id="mobile-sidebar-toggle" 
          aria-label="Toggle Sidebar"
          onClick={onSidebarToggle}
          style={{ display: 'inline-flex' }} // Handled via CSS usually, but styled consistently
        >
          <Menu size={20} />
        </button>
        <h1 id="view-title" className="view-title">
          {viewTitles[activeView] || 'Dashboard'}
        </h1>
      </div>
      
      <div className="topbar-right">
        <div className="quick-status-badge hide-mobile">
          <span className="dot-indicator green"></span>
          <span>Local Sync Active</span>
        </div>
        
        <button className="btn btn-secondary csv-export-btn" id="btn-export-csv" onClick={onExportCsv}>
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>
    </header>
  );
}
