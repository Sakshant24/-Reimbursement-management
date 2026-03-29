import React, { useState, useEffect } from 'react';
import api from '../../api';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'EMPLOYEE' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', newUser);
      setNewUser({ name: '', email: '', role: 'EMPLOYEE' });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create user'); }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message); }
  };

  const handleAssignManager = async (id, managerId) => {
    if (!managerId) return;
    try {
      await api.patch(`/users/${id}/manager`, { managerId });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message); }
  };

  const managers = users.filter(u => u.role === 'MANAGER');

  return (
    <div className="p-6 max-h-[700px] overflow-y-auto">
      <div className="mb-8 p-6 bg-base/50 border border-border/50 rounded shadow-inner relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent/50"></div>
        <h3 className="text-[10px] font-mono text-muted mb-4 tracking-widest uppercase border-b border-border/50 pb-2 font-bold">Create New User</h3>
        <form onSubmit={handleCreateUser} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-[10px] font-mono text-muted mb-1 uppercase tracking-widest">Full Name</label>
            <input type="text" required className="w-full font-mono text-sm" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Bob Smith" />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-mono text-muted mb-1 uppercase tracking-widest">Email Address</label>
            <input type="email" required className="w-full font-mono text-sm" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="bob@corp.com" />
          </div>
          <div className="w-48">
             <label className="block text-[10px] font-mono text-muted mb-1 uppercase tracking-widest">Role</label>
             <select required className="w-full font-mono text-sm bg-base" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
             </select>
          </div>
          <button type="submit" className="bg-accent/10 border border-accent text-accent px-6 py-[9px] font-mono text-[11px] font-bold tracking-widest hover:bg-accent hover:text-base transition-colors rounded uppercase shadow-[0_0_8px_rgba(0,229,160,0.1)] hover:shadow-[0_0_12px_rgba(0,229,160,0.3)]">Create</button>
        </form>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-base/50">
            <th className="p-3 text-[10px] font-mono text-muted uppercase tracking-widest whitespace-nowrap">User Info</th>
            <th className="p-3 text-[10px] font-mono text-muted uppercase tracking-widest whitespace-nowrap">Role</th>
            <th className="p-3 text-[10px] font-mono text-muted uppercase tracking-widest whitespace-nowrap">Manager</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <tr><td colSpan="3" className="p-6 text-center animate-pulse text-xs text-accent font-mono tracking-widest">Loading users...</td></tr> : users.map(u => (
            <tr key={u.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
              <td className="p-3">
                <p className="text-sm font-bold text-primary">{u.name}</p>
                <p className="text-[10px] font-mono text-muted tracking-widest mt-1 uppercase">{u.email} • ID:{u.id.split('-')[0]}</p>
              </td>
              <td className="p-3">
                <select 
                  className="font-mono text-[11px] bg-base border-border rounded px-2 py-1 tracking-widest uppercase cursor-pointer"
                  value={u.role}
                  onChange={e => handleChangeRole(u.id, e.target.value)}
                  disabled={u.role === 'ADMIN'}
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  {u.role === 'ADMIN' && <option value="ADMIN">ADMIN</option>}
                </select>
              </td>
              <td className="p-3">
                {u.role === 'ADMIN' ? <span className="text-[10px] text-muted font-mono tracking-widest block py-1.5 opacity-50">Admin (N/A)</span> : (
                  <select 
                    className="font-mono text-[11px] bg-base border-border rounded px-2 py-1 tracking-widest uppercase w-full max-w-[200px] cursor-pointer"
                    value={u.managerId || ''}
                    onChange={e => handleAssignManager(u.id, e.target.value)}
                  >
                    <option value="">-- UNASSIGNED --</option>
                    {managers.map(m => m.id !== u.id && <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTab;
