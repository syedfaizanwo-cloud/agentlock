'use client';

import React, { useState } from 'react';
import { ApprovalRequest } from '../../types/api';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
} from 'lucide-react';

interface ApprovalCenterProps {
  approvals: ApprovalRequest[];
  onApprove: (id: string, note?: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

export const ApprovalCenter: React.FC<ApprovalCenterProps> = ({
  approvals,
  onApprove,
  onReject,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewerNote, setReviewerNote] = useState<Record<string, string>>({});
  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    action: 'approve' | 'reject';
    agentName: string;
    riskScore: number;
  } | null>(null);

  const filteredApprovals = approvals.filter((appr) => {
    if (activeFilter === 'pending') return appr.status === 'pending';
    if (activeFilter === 'resolved') return appr.status !== 'pending';
    return true;
  });

  const handleApproveAction = async (id: string) => {
    setProcessingId(id);
    try {
      await onApprove(id, reviewerNote[id] || 'Verified and approved by Lead SecOps Director Vikas.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectAction = async (id: string) => {
    setProcessingId(id);
    try {
      await onReject(id, reviewerNote[id] || 'Rejected: Elevated risk profile violates zero-trust constraints.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
              Human-in-the-Loop Approval Center
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[rgba(230,203,168,0.14)] border border-[#B89B72] text-[#E6CBA8]">
              {approvals.filter((a) => a.status === 'pending').length} Pending Review
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-0.5">
            Manual authorization gate for autonomous operations exceeding L2 risk thresholds.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#151515] border border-[#2A2A2A] text-xs font-mono">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'pending'
                ? 'bg-[#E6CBA8] text-[#0A0A0A] font-bold'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            Pending Queue ({approvals.filter((a) => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'resolved'
                ? 'bg-[#E6CBA8] text-[#0A0A0A] font-bold'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            Resolved ({approvals.filter((a) => a.status !== 'pending').length})
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#E6CBA8] text-[#0A0A0A] font-bold'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            All Logs ({approvals.length})
          </button>
        </div>
      </div>

      {/* Queue Stream */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] p-8 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#6FAF8A] mx-auto" />
            <h3 className="text-sm font-mono font-bold text-white">No Pending Approvals</h3>
            <p className="text-xs text-[#8A8A8A]">
              The human-in-the-loop queue is clear. All autonomous actions within baseline policy.
            </p>
          </div>
        ) : (
          filteredApprovals.map((req) => (
            <div
              key={req.id}
              className={`p-5 rounded-2xl bg-[#0D0D0D] border transition-all ${
                req.status === 'pending'
                  ? 'border-[#B89B72]/50'
                  : req.status === 'approved'
                  ? 'border-[#6FAF8A]/30 opacity-90'
                  : 'border-[#C0504D]/30 opacity-90'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Details Column */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-mono font-bold text-white">{req.id}</span>
                    <span className="text-xs font-mono text-white bg-[#151515] px-2 py-0.5 rounded border border-[#2A2A2A]">
                      {req.agent_name}
                    </span>
                    <span className="text-xs font-mono text-[#8A8A8A] uppercase">
                      Action: [{req.action_type}]
                    </span>

                    {req.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]">
                        <Clock className="w-3 h-3" /> PENDING REVIEW
                      </span>
                    ) : req.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#6FAF8A]/10 text-[#6FAF8A] border border-[#6FAF8A]/30">
                        <CheckCircle2 className="w-3 h-3" /> APPROVED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#C0504D]/10 text-[#C0504D] border border-[#C0504D]/30">
                        <XCircle className="w-3 h-3" /> REJECTED
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-[#8A8A8A] uppercase block mb-0.5">
                      Target Resource:
                    </span>
                    <div className="p-2 rounded-lg bg-[#050505] border border-[#2A2A2A] text-xs font-mono text-white break-all">
                      {req.target}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-[#8A8A8A] uppercase block mb-0.5">
                      Escalation Reason:
                    </span>
                    <p className="text-xs text-[#BDBDBD] font-sans leading-relaxed">{req.reason}</p>
                  </div>

                  {/* Parameters Inspection */}
                  {req.parameters && Object.keys(req.parameters).length > 0 && (
                    <details className="text-xs font-mono text-[#8A8A8A]">
                      <summary className="cursor-pointer text-[#E6CBA8] hover:text-[#F7E7CE]">
                        Inspect Execution Parameters ({Object.keys(req.parameters).length} fields)
                      </summary>
                      <pre className="mt-2 p-3 rounded-lg bg-[#050505] border border-[#2A2A2A] text-[#BDBDBD] text-[11px] overflow-x-auto">
                        {JSON.stringify(req.parameters, null, 2)}
                      </pre>
                    </details>
                  )}

                  {/* Resolution Sign-Off Tag if Resolved */}
                  {req.reviewer && (
                    <div className="p-2.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-xs font-mono text-[#BDBDBD] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-white">
                        <UserCheck className="w-3.5 h-3.5 text-[#6FAF8A]" /> Reviewed by: {req.reviewer}
                      </span>
                      <span className="text-[#8A8A8A]">
                        {req.review_timestamp ? new Date(req.review_timestamp).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Decision Actions Column */}
                <div className="flex flex-col items-start lg:items-end justify-between gap-3 lg:w-72 flex-shrink-0 pt-2 lg:pt-0">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-mono text-[#8A8A8A]">Risk Assessment</div>
                      <div className="text-base font-mono font-bold text-[#C0504D]">
                        {req.risk_score} / 100
                      </div>
                    </div>
                    <div className="h-8 w-px bg-[#2A2A2A]" />
                    <div className="text-right">
                      <div className="text-xs font-mono text-[#8A8A8A]">Severity</div>
                      <span className="text-xs font-mono font-bold text-[#E6CBA8] uppercase">
                        {req.severity}
                      </span>
                    </div>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="w-full space-y-2 pt-2 border-t border-[#2A2A2A]">
                      <input
                        type="text"
                        placeholder="Optional review note..."
                        value={reviewerNote[req.id] || ''}
                        onChange={(e) =>
                          setReviewerNote({ ...reviewerNote, [req.id]: e.target.value })
                        }
                        className="w-full p-2 rounded-lg bg-[#151515] border border-[#2A2A2A] text-xs font-mono text-white placeholder-[#5C5C5C] focus:outline-none focus:border-[#E6CBA8]"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          disabled={processingId === req.id}
                          onClick={() => {
                            if (req.risk_score >= 80 || req.dual_authorization_required) {
                              setConfirmModal({
                                id: req.id,
                                action: 'approve',
                                agentName: req.agent_name,
                                riskScore: req.risk_score,
                              });
                            } else {
                              handleApproveAction(req.id);
                            }
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#6FAF8A]/15 border border-[#6FAF8A]/40 text-[#6FAF8A] hover:bg-[#6FAF8A]/25 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve (1-Time)
                        </button>

                        <button
                          disabled={processingId === req.id}
                          onClick={() =>
                            setConfirmModal({
                              id: req.id,
                              action: 'reject',
                              agentName: req.agent_name,
                              riskScore: req.risk_score,
                            })
                          }
                          className="flex-1 py-2 px-3 rounded-xl bg-[#C0504D]/15 border border-[#C0504D]/40 text-[#C0504D] hover:bg-[#C0504D]/25 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmModal && (
        <ConfirmDialog
          isOpen={true}
          title={
            confirmModal.action === 'reject'
              ? `Deny Execution for ${confirmModal.agentName}`
              : `Confirm High-Risk Sign-off (Score: ${confirmModal.riskScore})`
          }
          isDestructive={confirmModal.action === 'reject'}
          description={
            confirmModal.action === 'reject'
              ? 'This will immediately reject the suspended agent action and log the denial with your cryptographic SecOps signature in the immutable ledger.'
              : 'CRITICAL AUTHORIZATION: This action possesses an elevated risk score and requires explicit verification before issuing a one-time scoped execution credential.'
          }
          confirmText={confirmModal.action === 'reject' ? 'Deny Action' : 'Authorize Execution'}
          cancelText="Cancel"
          isLoading={processingId === confirmModal.id}
          onConfirm={async () => {
            if (confirmModal.action === 'reject') {
              await handleRejectAction(confirmModal.id);
            } else {
              await handleApproveAction(confirmModal.id);
            }
            setConfirmModal(null);
          }}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};
