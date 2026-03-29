import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import ApprovalStepper from '../../components/ApprovalStepper';

const ManagerDashboard = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/approvals/pending');
      setPending(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (expenseId, actionType) => {
    if (actionType === 'Reject' && (!comment || comment.trim().length < 3)) {
      alert('A rejection reason (min 3 chars) is required.');
      return;
    }

    setActionLoading(true);
    try {
      const endpoint = actionType === 'APPROVE' ? `/approvals/${expenseId}/approve` : `/approvals/${expenseId}/reject`;
      await api.post(endpoint, { comments: comment });
      setComment('');
      setExpandedId(null);
      fetchPending(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || `FAILED_TO_${actionType}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-6 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-wider text-accent">Pending Approvals</h2>
          <p className="text-xs font-mono text-muted tracking-widest mt-2 uppercase">Action Required // User ID: {user?.id.split('-')[0]}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-danger/10 border-l-4 border-danger text-danger text-sm font-mono tracking-wider">
          [ERROR] {error}
        </div>
      )}

      <div className="grid gap-6">
        {loading ? (
           <div className="p-8 text-center text-accent animate-pulse font-mono tracking-widest bg-surface border border-border mt-4">Loading pending approvals...</div>
        ) : pending.length === 0 ? (
           <div className="p-8 text-center text-muted font-mono tracking-widest uppercase bg-surface border border-border mt-4 shadow-inner">You have no pending approvals in your queue.</div>
        ) : (
          pending.map(exp => (
            <div key={exp.id} className="bg-surface border border-border rounded-lg shadow-2xl relative overflow-hidden transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-warning"></div>
              
              <div 
                className="p-6 cursor-pointer flex justify-between items-center hover:bg-white/[0.02]"
                onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
              >
                <div>
                  <h3 className="text-lg font-bold text-primary">{exp.user.name}</h3>
                  <p className="text-xs font-mono text-muted tracking-widest mt-1 uppercase">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-mono font-bold text-accent">{exp.convertedAmount} <span className="text-sm text-muted">{user?.company?.defaultCurrency}</span></p>
                  <p className="text-[10px] font-mono text-warning tracking-widest mt-1 uppercase animate-pulse shadow-warning">Pending Approval</p>
                </div>
              </div>

              {expandedId === exp.id && (
                <div className="p-6 border-t border-border bg-base/30 animate-in slide-in-from-top-4">
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                      <p className="font-mono text-xs text-muted mb-1 uppercase tracking-widest">Description</p>
                      <p className="text-sm text-primary">{exp.description}</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-muted mb-1 uppercase tracking-widest">Original Amount</p>
                      <p className="text-sm font-mono">{exp.amount} {exp.currency} <span className="text-muted text-xs ml-2">(Rate: {exp.exchangeRate})</span></p>
                    </div>
                  </div>

                  {exp.receiptPath && (
                    <div className="mb-6">
                      <a 
                        href={`http://localhost:5000/${exp.receiptPath.replace(/\\/g, '/')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-mono text-accent hover:text-base hover:bg-accent border border-accent/20 px-3 py-1.5 bg-accent/5 rounded transition-colors uppercase tracking-widest shadow-inner inline-block"
                      >
                        View Attached Receipt
                      </a>
                    </div>
                  )}

                  <div className="mb-6 border border-border/50 p-4 rounded bg-surface shadow-inner">
                    <p className="font-mono text-xs text-muted mb-2 uppercase tracking-widest border-b border-border/50 pb-2">Approval Chain</p>
                    <ApprovalStepper approvals={exp.approvals} />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="font-mono text-xs text-muted uppercase tracking-widest">Comments (Optional)</label>
                    <textarea 
                      className="w-full font-mono text-sm min-h-[80px]"
                      placeholder="Enter justification log (required for rejection)"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                    <div className="flex justify-end gap-4 mt-2">
                       <button 
                        disabled={actionLoading}
                        onClick={() => handleAction(exp.id, 'Reject')}
                        className="bg-danger/10 border border-danger text-danger px-6 py-2 font-mono text-[11px] font-bold tracking-widest hover:bg-danger hover:text-white transition-colors rounded uppercase disabled:opacity-50 shadow-[0_0_10px_rgba(255,77,109,0.1)] hover:shadow-[0_0_15px_rgba(255,77,109,0.3)]"
                      >
                        Reject
                      </button>
                      <button 
                        disabled={actionLoading}
                        onClick={() => handleAction(exp.id, 'APPROVE')}
                        className="bg-accent/10 border border-accent text-accent px-6 py-2 font-mono text-[11px] font-bold tracking-widest hover:bg-accent hover:text-base transition-colors rounded uppercase disabled:opacity-50 shadow-[0_0_10px_rgba(0,229,160,0.1)] hover:shadow-[0_0_15px_rgba(0,229,160,0.3)]"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
