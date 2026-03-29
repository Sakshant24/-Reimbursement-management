import React from 'react';

const StatusBadge = ({ status }) => {
  if (status === 'APPROVED') {
    return <span className="px-2 py-1 text-[10px] font-mono font-bold tracking-widest rounded bg-accent/10 text-accent border border-accent/20">APPROVED</span>;
  }
  if (status === 'RejectED') {
    return <span className="px-2 py-1 text-[10px] font-mono font-bold tracking-widest rounded bg-danger/10 text-danger border border-danger/20">RejectED</span>;
  }
  return <span className="px-2 py-1 text-[10px] font-mono font-bold tracking-widest rounded bg-warning/10 text-warning border border-warning/20">PENDING</span>;
};

export default StatusBadge;
