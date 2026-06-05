import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function WipeConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      id="modal-wipe-confirm"
      onClick={(e) => {
        if (e.target.id === 'modal-wipe-confirm') onClose();
      }}
    >
      <div className="modal-card glass-card">
        <div className="modal-header text-danger">
          <AlertTriangle className="modal-icon" size={24} />
          <h3>Clear Database Permanently?</h3>
        </div>
        <div className="modal-body">
          <p>This action will wipe all transactions, budgets, and customization options from your browser's local storage. This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" id="btn-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" id="btn-modal-confirm" onClick={onConfirm}>Confirm Wipe</button>
        </div>
      </div>
    </div>
  );
}
