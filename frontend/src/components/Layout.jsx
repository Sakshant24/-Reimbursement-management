import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getLinks = () => {
    if (user?.role === 'ADMIN') return [{ name: 'Admin Console', path: '/admin' }, { name: 'My Expenses', path: '/employee' }];
    if (user?.role === 'MANAGER') return [{ name: 'Manager Approvals', path: '/manager' }, { name: 'My Expenses', path: '/employee' }];
    return [{ name: 'My Dashboard', path: '/employee' }];
  };

  return (
    <div className="min-h-screen flex bg-base text-primary font-display">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-xl font-bold tracking-wider text-accent font-mono">Reimbursement Portal</h1>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {getLinks().map(link => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 rounded-md transition-colors font-mono text-sm tracking-wide ${isActive ? 'bg-accent/10 border border-accent/20 text-accent font-semibold shadow-inner' : 'hover:bg-border text-muted hover:text-primary'}`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-border mt-auto">
          <div className="mb-4">
            <p className="font-mono text-xs text-muted mb-1 tracking-wider uppercase">Logged in as:</p>
            <p className="text-sm font-medium text-primary break-words">{user?.name}</p>
            <p className="text-xs text-accent mt-1 font-mono tracking-widest">{user?.role}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full text-center border border-danger text-danger hover:bg-danger/10 focus:ring-2 focus:ring-danger transition-all py-2 text-xs font-mono font-bold tracking-widest rounded uppercase"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-base relative">
        <div className="p-8 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
