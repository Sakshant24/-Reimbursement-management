import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import ApprovalStepper from '../../components/ApprovalStepper';

const EmployeeDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    // Fetch detail to get approvals if not loaded
    const expense = expenses.find(e => e.id === id);
    if (!expense.approvalsLoaded) {
      try {
        const detail = await api.get(`/expenses/${id}`);
        setExpenses(prev => prev.map(e => e.id === id ? { ...detail.data.data, approvalsLoaded: true } : e));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-6 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-wider text-accent">My Expenses</h2>
          <p className="text-xs font-mono text-muted tracking-widest mt-2 uppercase">Company: {user?.company?.name} // User ID: {user?.id.split('-')[0]}</p>
        </div>
        <Link 
          to="/employee/new"
          className="bg-accent/10 border border-accent text-accent px-4 py-2 font-mono text-sm tracking-widest hover:bg-accent hover:text-base transition-colors rounded uppercase shadow-[0_0_15px_rgba(0,229,160,0.1)] hover:shadow-[0_0_20px_rgba(0,229,160,0.3)]"
        >
          + New Expense
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent/50"></div>
        {loading ? (
          <div className="p-8 text-center text-accent animate-pulse font-mono tracking-widest">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-muted font-mono tracking-widest uppercase">You have not submitted any expenses.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-base/80">
                <th className="p-4 text-xs font-mono text-muted uppercase tracking-widest whitespace-nowrap">Date</th>
                <th className="p-4 text-xs font-mono text-muted uppercase tracking-widest whitespace-nowrap">Category</th>
                <th className="p-4 text-xs font-mono text-muted uppercase tracking-widest whitespace-nowrap">Receipt Amount</th>
                <th className="p-4 text-xs font-mono text-muted uppercase tracking-widest whitespace-nowrap">Converted Base</th>
                <th className="p-4 text-xs font-mono text-muted uppercase tracking-widest whitespace-nowrap">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <React.Fragment key={exp.id}>
                  <tr 
                    onClick={() => toggleExpand(exp.id)}
                    className="border-b border-border/50 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-mono text-sm whitespace-nowrap">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="p-4 font-mono text-xs text-primary">{exp.category}</td>
                    <td className="p-4 font-mono text-sm whitespace-nowrap">{exp.amount} <span className="text-muted text-xs ml-1">{exp.currency}</span></td>
                    <td className="p-4 font-mono text-sm whitespace-nowrap">{exp.convertedAmount} <span className="text-muted text-xs ml-1">{user?.company?.defaultCurrency}</span></td>
                    <td className="p-4"><StatusBadge status={exp.status} /></td>
                  </tr>
                  {expandedId === exp.id && (
                    <tr className="bg-base/50">
                      <td colSpan="5" className="p-6 border-b border-border relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-warning/50"></div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-mono text-xs text-muted mb-1 uppercase tracking-widest">Description</p>
                            <p className="text-sm font-medium">{exp.description}</p>
                            <p className="font-mono text-[10px] text-muted mt-2 tracking-widest">Transaction ID: {exp.id}</p>
                          </div>
                          {exp.receiptPath && (
                            <a 
                              href={`http://localhost:5000/${exp.receiptPath.replace(/\\/g, '/')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs font-mono text-accent hover:text-base hover:bg-accent border border-accent/20 px-3 py-1 bg-accent/5 rounded transition-colors uppercase tracking-widest shadow-inner inline-block"
                            >
                              View Receipt
                            </a>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-border border-dashed">
                          <p className="font-mono text-xs text-muted mb-2 uppercase tracking-widest">Approval Flow</p>
                          {!exp.approvalsLoaded ? (
                            <span className="text-xs text-accent animate-pulse font-mono tracking-widest">Loading approvals...</span>
                          ) : (
                            <ApprovalStepper approvals={exp.approvals} />
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
