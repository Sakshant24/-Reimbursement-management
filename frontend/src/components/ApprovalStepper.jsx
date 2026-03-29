import React from 'react';

const ApprovalStepper = ({ approvals }) => {
  if (!approvals || approvals.length === 0) {
    return <div className="text-xs font-mono text-muted py-2 tracking-widest">No approval steps configured.</div>;
  }

  // Ensure sorted by stepOrder
  const sorted = [...approvals].sort((a,b) => a.stepOrder - b.stepOrder);

  return (
    <div className="flex items-center space-x-2 overflow-x-auto py-4">
      {sorted.map((approval, idx) => {
        const isApproved = approval.status === 'APPROVED';
        const isRejected = approval.status === 'RejectED';
        const isPending = approval.status === 'PENDING';
        
        let dotClass = "w-3 h-3 rounded-sm bg-border border border-muted"; // Default waiting
        let textClass = "text-muted";
        
        if (isApproved) {
          dotClass = "w-3 h-3 rounded-sm bg-accent shadow-[0_0_8px_rgba(0,229,160,0.6)]";
          textClass = "text-accent";
        } else if (isRejected) {
          dotClass = "w-3 h-3 rounded-sm bg-danger shadow-[0_0_8px_rgba(255,77,109,0.6)]";
          textClass = "text-danger";
        } else if (isPending) {
          dotClass = "w-3 h-3 rounded-sm bg-warning animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]";
          textClass = "text-warning";
        }

        return (
          <React.Fragment key={approval.id}>
            <div className="flex flex-col items-center">
              <span className={`text-[10px] font-mono whitespace-nowrap mb-1 tracking-widest ${textClass}`}>
                Step {approval.stepOrder}
              </span>
              <div className={dotClass}></div>
              <span className="text-xs font-medium mt-1 whitespace-nowrap text-primary">
                {approval.approver?.name || 'Unknown'} {approval.isManagerStep && <span className="text-[10px] text-muted ml-1">[MGR]</span>}
              </span>
              <span className={`text-[10px] uppercase font-mono mt-0.5 tracking-widest ${textClass}`}>
                {approval.status}
              </span>
            </div>
            {idx < sorted.length - 1 && (
              <div className={`h-px w-12 mx-2 ${isApproved ? 'bg-accent/50' : 'bg-border'}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ApprovalStepper;
