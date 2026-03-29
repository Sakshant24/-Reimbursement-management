import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UsersTab from './UsersTab';
import RulesTab from './RulesTab';
import ExpensesTab from './ExpensesTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('USERS');
  const { user } = useAuth();

  const tabs = [
    { id: 'USERS', label: 'Users' },
    { id: 'RULES', label: 'Approval Rules' },
    { id: 'EXPENSES', label: 'All Expenses' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-wider text-accent">System Admin Dashboard</h2>
          <p className="text-xs font-mono text-muted tracking-widest mt-2 uppercase">Elevated Privileges // User ID: {user?.id.split('-')[0]}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors relative ${activeTab === tab.id ? 'text-accent font-bold' : 'text-muted hover:text-primary'}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent shadow-[0_0_8px_rgba(0,229,160,0.8)]"></div>}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-2xl min-h-[500px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent/20"></div>
        {activeTab === 'USERS' && <UsersTab />}
        {activeTab === 'RULES' && <RulesTab />}
        {activeTab === 'EXPENSES' && <ExpensesTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;
