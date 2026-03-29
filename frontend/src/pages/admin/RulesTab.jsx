import React, { useState, useEffect } from 'react';
import api from '../../api';

const RulesTab = () => {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    categoryFilter: '',
    isManagerFirst: true,
    ruleType: 'SEQUENTIAL',
    thresholdPercentage: '',
    specificApproverId: '',
    approverSequence: []
  });

  useEffect(() => {
    fetchRules();
    fetchUsers();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await api.get('/rules');
      setRules(res.data.data);
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch(err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ARE YOU ABSOLUTELY SURE YOU WANT TO PURGE THIS RULE RECORD?")) return;
    try {
      await api.delete(`/rules/${id}`);
      fetchRules();
    } catch(err) { alert(err.response?.data?.message || 'FAILED_TO_Delete_SYSTEM_IS_LOCKED'); }
  };

  const addStep = () => {
    const nextOrder = formData.isManagerFirst ? formData.approverSequence.length + 2 : formData.approverSequence.length + 1;
    setFormData({
      ...formData,
      approverSequence: [...formData.approverSequence, { userId: '', stepOrder: nextOrder }]
    });
  };

  const updateStepUser = (index, userId) => {
    const newSeq = [...formData.approverSequence];
    newSeq[index].userId = userId;
    setFormData({ ...formData, approverSequence: newSeq });
  };

  const removeStep = (index) => {
    const newSeq = [...formData.approverSequence];
    newSeq.splice(index, 1);
    const startOrder = formData.isManagerFirst ? 2 : 1;
    newSeq.forEach((step, i) => {
        step.stepOrder = startOrder + i;
    });
    setFormData({ ...formData, approverSequence: newSeq });
  };

  const toggleManagerFirst = () => {
    const newManagerFirst = !formData.isManagerFirst;
    const startOrder = newManagerFirst ? 2 : 1;
    const newSeq = formData.approverSequence.map((step, i) => ({
      ...step,
      stepOrder: startOrder + i
    }));
    setFormData({ ...formData, isManagerFirst: newManagerFirst, approverSequence: newSeq });
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.categoryFilter) payload.categoryFilter = null;
      if (['PERCENTAGE', 'HYBRID'].includes(payload.ruleType)) {
        payload.thresholdPercentage = Number(payload.thresholdPercentage);
      } else {
        delete payload.thresholdPercentage;
      }
      if (!['SPECIFIC', 'HYBRID'].includes(payload.ruleType)) {
        delete payload.specificApproverId;
      }

      await api.post('/rules', payload);
      setShowBuilder(false);
      setFormData({
        name: '', categoryFilter: '', isManagerFirst: true, ruleType: 'SEQUENTIAL',
        thresholdPercentage: '', specificApproverId: '', approverSequence: []
      });
      fetchRules();
    } catch(err) { alert(err.response?.data?.message || 'RULE_COMPILATION_FAILED'); }
  };

  if (showBuilder) {
    return (
      <div className="p-6 max-h-[700px] overflow-y-auto">
        <div className="mb-6 flex justify-between items-center border-b border-border pb-4">
          <h3 className="text-lg font-mono tracking-widest text-accent uppercase font-bold textShadow">Create New Rule</h3>
          <button onClick={() => setShowBuilder(false)} className="text-[10px] font-mono font-bold text-muted hover:text-danger hover:border-danger tracking-widest uppercase border border-muted px-4 py-2 rounded transition-colors">Cancel_BUILD</button>
        </div>

        <form onSubmit={handleCreateRule} className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-mono text-muted mb-2 uppercase tracking-widest">Rule Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full font-mono text-sm tracking-wider" placeholder="e.g. Exec Travel Rule" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-muted mb-2 uppercase tracking-widest">Category_FILTER</label>
              <select value={formData.categoryFilter} onChange={e => setFormData({...formData, categoryFilter: e.target.value})} className="w-full font-mono text-sm bg-base tracking-wider cursor-pointer">
                <option value="">[ GLOBAL / ALL CATEGORIES ]</option>
                <option value="TRAVEL">TRAVEL</option>
                <option value="FOOD">FOOD</option>
                <option value="ACCOMMODATION">ACCOMMODATION</option>
                <option value="OFFICE_SUPPLIES">OFFICE_SUPPLIES</option>
                <option value="CONFERENCE">CONFERENCE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="border border-border/50 p-6 rounded bg-base/30 shadow-inner relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent/30"></div>
            <h4 className="text-[10px] font-bold font-mono text-accent mb-4 tracking-[0.2em] uppercase border-b border-accent/20 pb-2">Approver Sequence</h4>
            
            <div className="flex items-center gap-3 mb-6 p-3 bg-surface border border-border/50 rounded inline-flex">
               <input type="checkbox" id="mgrToggle" checked={formData.isManagerFirst} onChange={toggleManagerFirst} className="w-4 h-4 bg-base border-border accent-accent cursor-pointer" />
               <label htmlFor="mgrToggle" className="text-[10px] font-mono text-primary tracking-widest uppercase cursor-pointer">Manager must approve first</label>
            </div>

            <div className="space-y-3">
               {formData.isManagerFirst && (
                 <div className="flex items-center gap-4 bg-surface p-3 border border-border/50 rounded opacity-70">
                   <span className="text-[10px] font-mono text-muted tracking-widest w-16">Step 1</span>
                   <span className="text-sm font-bold text-primary font-mono select-none tracking-widest">[ Direct Manager ]</span>
                 </div>
               )}
               {formData.approverSequence.map((step, idx) => (
                 <div key={idx} className="flex items-center gap-4 bg-surface p-3 border border-border/50 rounded hover:border-border transition-colors">
                   <span className="text-[10px] font-mono text-accent font-bold tracking-widest w-16">Step {step.stepOrder}</span>
                   <select required value={step.userId} onChange={e => updateStepUser(idx, e.target.value)} className="flex-1 font-mono text-[11px] uppercase tracking-widest bg-base border-border cursor-pointer">
                     <option value="">-- -- Select Approver -- --</option>
                     {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                   </select>
                   <button type="button" onClick={() => removeStep(idx)} className="text-[10px] font-mono text-danger font-bold tracking-widest uppercase px-3 py-1 hover:bg-danger/10 rounded transition-colors">Remove</button>
                 </div>
               ))}
               <button type="button" onClick={addStep} className="mt-4 text-[10px] font-bold font-mono text-accent border border-accent/30 bg-accent/5 px-4 py-2 hover:bg-accent/20 transition-colors uppercase tracking-widest shadow-[0_0_8px_rgba(0,229,160,0.1)]">+ Add Step</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4">
            <div className="col-span-1 border-l-2 border-border pl-4">
              <label className="block text-[10px] font-mono text-muted mb-2 uppercase tracking-widest">Rule Type</label>
              <select value={formData.ruleType} onChange={e => setFormData({...formData, ruleType: e.target.value})} className="w-full font-mono text-[11px] tracking-widest uppercase bg-base cursor-pointer">
                <option value="SEQUENTIAL">SEQUENTIAL (STANDARD)</option>
                <option value="PERCENTAGE">PERCENTAGE (THRESHOLD)</option>
                <option value="SPECIFIC">SPECIFIC (DIRECTOR BYPASS)</option>
                <option value="HYBRID">HYBRID (MULTI-CONDITIONAL)</option>
              </select>
            </div>
            
            {(formData.ruleType === 'PERCENTAGE' || formData.ruleType === 'HYBRID') && (
              <div className="col-span-1 border-l-2 border-warning/50 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <label className="block text-[10px] font-mono text-warning mb-2 uppercase tracking-widest">Approval Threshold %</label>
                <input type="number" min="1" max="100" required value={formData.thresholdPercentage} onChange={e => setFormData({...formData, thresholdPercentage: e.target.value})} className="w-full font-mono text-sm border-warning/50 focus:border-warning focus:ring-warning" placeholder="60" />
              </div>
            )}

            {(formData.ruleType === 'SPECIFIC' || formData.ruleType === 'HYBRID') && (
              <div className="col-span-1 border-l-2 border-warning/50 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <label className="block text-[10px] font-mono text-warning mb-2 uppercase tracking-widest">Auto-Approve if Approved By</label>
                <select required value={formData.specificApproverId} onChange={e => setFormData({...formData, specificApproverId: e.target.value})} className="w-full font-mono text-[11px] uppercase tracking-widest bg-base border-warning/50 focus:border-warning cursor-pointer">
                  <option value="">-- SELECT_ROOT_APPROVER --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-8 border-t border-border mt-8">
             <button type="submit" className="bg-accent text-base px-8 py-3 font-mono text-xs font-bold tracking-[0.2em] hover:bg-accent/80 transition-all rounded uppercase shadow-[0_0_20px_rgba(0,229,160,0.3)] hover:shadow-[0_0_25px_rgba(0,229,160,0.5)]">Save Rule</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 max-h-[700px] overflow-y-auto relative">
      <div className="flex justify-end mb-6">
        <button onClick={() => setShowBuilder(true)} className="bg-accent/10 border border-accent text-accent px-5 py-2.5 font-mono text-[11px] font-bold tracking-widest hover:bg-accent hover:text-base transition-all rounded uppercase shadow-[0_0_10px_rgba(0,229,160,0.2)] hover:shadow-[0_0_15px_rgba(0,229,160,0.4)]">
          + Create New Rule
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? <div className="p-6 text-center text-xs font-mono text-accent animate-pulse tracking-widest uppercase">FETCHING_Approval Rules...</div> : rules.length === 0 ? <div className="p-6 text-center text-xs font-mono text-muted uppercase tracking-widest bg-surface border border-border shadow-inner">No rules found. Create one above.</div> : rules.map(rule => (
          <div key={rule.id} className="p-5 bg-base/50 border border-border rounded flex justify-between items-center hover:bg-white/[0.02] transition-colors relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent/50"></div>
            <div className="pl-2">
              <h4 className="text-sm font-bold text-primary font-mono tracking-wider">{rule.name}</h4>
              <p className="text-[9px] font-mono text-muted tracking-[0.15em] mt-2 uppercase flex items-center gap-3">
                <span className="bg-surface px-2 py-1 border border-border/50 rounded shadow-sm">Type: <span className="text-accent">{rule.ruleType}</span></span>
                <span className="bg-surface px-2 py-1 border border-border/50 rounded shadow-sm">Category: <span className="text-primary">{rule.categoryFilter || 'GLOBAL'}</span></span>
                <span className="bg-surface px-2 py-1 border border-border/50 rounded shadow-sm">Manager 1st: <span className="text-primary">{rule.isManagerFirst ? 'YES' : 'NO'}</span></span>
              </p>
            </div>
            <button onClick={() => handleDelete(rule.id)} className="text-[10px] uppercase font-mono tracking-widest font-bold text-danger hover:underline hover:bg-danger/10 px-4 py-2 border border-transparent hover:border-danger/30 rounded transition-colors">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RulesTab;
