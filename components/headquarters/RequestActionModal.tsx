"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RequestActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "approve" | "reject";
    onConfirm: (reason?: string) => void;
    orgName: string;
}

export default function RequestActionModal({
    isOpen,
    onClose,
    type,
    onConfirm,
    orgName,
}: RequestActionModalProps) {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    const isApprove = type === "approve";

    const handleConfirm = () => {
        if (!isApprove && !reason.trim()) {
            alert("Please provide a rejection reason.");
            return;
        }
        onConfirm(reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#161922] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10"
            >
                <div className={`p-8 ${isApprove ? "bg-accent/5 border-b border-accent/10" : "bg-red-500/5 border-b border-red-500/10"}`}>
                    <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-full ${isApprove ? "bg-accent/10 text-accent shadow-[0_0_20px_rgba(45,212,191,0.2)]" : "bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"}`}>
                            {isApprove ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                {isApprove ? "Approve Request" : "Reject Request"}
                            </h3>
                            <p className="text-sm text-slate-400">
                                {orgName}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {isApprove ? (
                        <div className="text-slate-300 text-sm space-y-4">
                            <p>By approving this request:</p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    <span>An admin signup invitation will be generated</span>
                                </li>
                                <li className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    <span>A signup link will be emailed to the organization</span>
                                </li>
                                <li className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    <span>Admin access will be enabled after signup completion</span>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-slate-400 text-sm">
                                This action will deny access. Please specify a reason for the audit log.
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                                    Reason for Rejection <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-4 py-3 text-sm bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 min-h-[120px] outline-none resize-none text-white placeholder-slate-700"
                                    placeholder="e.g., Missing 501(c)(3) documentation..."
                                />
                            </div>
                            <div className="flex items-start p-3 bg-amber-500/10 rounded-lg text-xs text-amber-200 border border-amber-500/20">
                                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 text-amber-500" />
                                This action is final and logged in the immutable audit trail.
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-8 py-6 bg-black/20 border-t border-white/5 flex justify-end gap-3 custom-pattern">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-6 py-2.5 text-sm font-bold text-dark-darker rounded-lg shadow-lg transition-all transform active:scale-95 ${isApprove
                                ? "bg-accent hover:bg-teal-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]"
                                : "bg-red-500 hover:bg-red-400 text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                            }`}
                    >
                        {isApprove ? "Confirm Approval" : "Reject Request"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
