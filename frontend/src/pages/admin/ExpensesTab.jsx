import React, { useState, useEffect } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';

const ExpensesTab = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data.data);
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  const handleOverride = async (id, status) => {
    const reason = prompt(`Enter override reason for ${status}:`);
    if (!reason) return;
    try {
      await api.patch(`/expenses/${id}/override`, { status, reason });
      fetchAll();
    } catch(err) { alert(err.response?.data?.message || 'OVERRIDE FAILED.'); }
  };

  return (
    <div className="p-6 max-h-[700px] overflow-y-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-base/50">
             <th className="p-3 text-[10px] font-mono text-muted uppercase tracking-widest whitespace-nowrap">Tx ID</th>
             <th className="p-3 text-[10px] font-mono text-muted uppercase tracking-widest whitespace-nowrap">Submitter</th>
             <th className="p-3 text-[10px] font-mono text-muted uppercase tracking-widest whitespace-nowrap">AMOUNT</th>
             <th className="p-3 text-[10px] font-mono text-muted uppercase tracking-widest whitespace-nowrap">STATUS</th>
             <th className="p-3 text-[10px] font-mono text-muted uppercase tracking-widest whitespace-nowrap text-right">Admin Override</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <tr><td colSpan="5" className="p-6 text-center animate-pulse text-xs text-accent font-mono tracking-widest">SCANNING_All Expenses...</td></tr> : expenses.map(exp => (
            <tr key={exp.id} className="border-b border-border/50 hover:bg-white/[0.02]">
              <td className="p-3 font-mono text-[10px] text-muted tracking-widest">{exp.id.split('-')[0]}</td>
              <td className="p-3 text-sm font-bold text-primary">{exp.user.name}</td>
              <td className="p-3 font-mono text-sm">{exp.convertedAmount}</td>
              <td className="p-3"><StatusBadge status={exp.status} /></td>
              <td className="p-3 text-right">
                {exp.status === 'PENDING' ? (
                  <div className="flex justify-end gap-2">
                     <button onClick={() => handleOverride(exp.id, 'APPROVED')} className="text-[10px] border border-accent text-accent px-3 py-1.5 rounded hover:bg-accent hover:text-base uppercase tracking-widest font-mono shadow-[0_0_8px_rgba(0,229,160,0.1)] transition-colors font-bold">Approve</button>
                     <button onClick={() => handleOverride(exp.id, 'RejectED')} className="text-[10px] border border-danger text-danger px-3 py-1.5 rounded hover:bg-danger hover:text-white uppercase tracking-widest font-mono shadow-[0_0_8px_rgba(255,77,109,0.1)] transition-colors font-bold">Reject</button>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-muted tracking-widest opacity-50 uppercase">CLOSED</span>
                )}
              </td>
            </tr>
          ))}
          {expenses.length === 0 && !loading && (
             <tr><td colSpan="5" className="p-6 text-center text-xs text-muted font-mono tracking-widest uppercase">No expenses found in the system.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default ExpensesTab;
