import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownLeft, CheckCircle, Clock, Filter, ExternalLink, History, ArrowUpRight, Receipt, Activity } from 'lucide-react';

type Txn = {
    id: string
    campaign: string
    amountInr: number
    amountUsdc: number
    beneficiaryId: string
    txHash?: string
    date: string
    status: 'Pending' | 'Completed' | 'Paid'
    category?: string
}

const TransactionHistory = ({ transactions }: { transactions: Txn[] }) => {
    return (
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 relative overflow-hidden group/container mt-8">
            {/* Subtle Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none opacity-50"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                            <History className="w-5 h-5" />
                        </div>
                        Transaction History
                    </h2>
                    <p className="text-gray-400 text-sm mt-2 ml-1">Track your earnings and campaign payouts</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A0A0A] border border-white/10 text-sm font-medium text-gray-300 hover:text-white hover:border-white/20 transition-all shadow-sm">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm font-bold text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all shadow-sm shadow-purple-500/5">
                        <ArrowDownLeft className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-20 border border-dashed border-white/10 rounded-2xl bg-[#0A0A0A]/50">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
                            <Activity className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No transaction history</h3>
                        <p className="text-gray-500 max-w-sm">Payments for fulfilled orders will appear here once processed on the blockchain.</p>
                    </div>
                ) : (
                    <>
                        {/* Header Row for Desktop */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-4">Campaign Details</div>
                            <div className="col-span-3">Status</div>
                            <div className="col-span-3">Date</div>
                            <div className="col-span-2 text-right">Amount</div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <AnimatePresence>
                                {transactions.map((txn, idx) => (
                                    <motion.div
                                        key={txn.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group p-5 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:border-white/10 hover:bg-[#151515] transition-all duration-300 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

                                        <div className="relative flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-4">

                                            {/* Mobile Header */}
                                            <div className="flex md:hidden w-full items-center justify-between mb-2">
                                                <span className="text-xs text-gray-500 font-mono">{txn.date}</span>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${txn.status === 'Completed' || txn.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                    {txn.status}
                                                </span>
                                            </div>

                                            {/* Campaign (Col 4) */}
                                            <div className="w-full md:col-span-4 flex items-center gap-4">
                                                <div className="hidden md:flex w-10 h-10 rounded-full bg-white/5 border border-white/5 items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                                    <Receipt className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-base truncate group-hover:text-purple-400 transition-colors">{txn.campaign}</h3>
                                                    {txn.category && <p className="text-xs text-gray-500 mt-0.5">{txn.category}</p>}
                                                    <p className="text-[10px] text-gray-600 font-mono mt-1 md:hidden">ID: {txn.beneficiaryId}</p>
                                                </div>
                                            </div>

                                            {/* Status (Col 3) */}
                                            <div className="hidden md:flex col-span-3 items-center">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${txn.status === 'Completed' || txn.status === 'Paid' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-blue-500/5 border-blue-500/20 text-blue-400'}`}>
                                                    {txn.status === 'Completed' || txn.status === 'Paid' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                    {txn.status === 'Paid' ? 'Payment Settled' : txn.status}
                                                </div>
                                            </div>

                                            {/* Date (Col 3) */}
                                            <div className="hidden md:flex col-span-3 text-sm text-gray-400 font-medium">
                                                {txn.date}
                                            </div>

                                            {/* Amount (Col 2) */}
                                            <div className="w-full md:col-span-2 flex items-center justify-between md:justify-end gap-4 text-right">
                                                <span className="md:hidden text-sm text-gray-500 font-medium">Total Details</span>
                                                <div>
                                                    <div className="text-lg font-bold text-white tracking-tight">₹{txn.amountInr.toLocaleString()}</div>
                                                    <div className="text-xs font-mono text-gray-500">{txn.amountUsdc.toFixed(2)} USDC</div>
                                                </div>
                                            </div>

                                            {/* Explorer Link (Action) */}
                                            {txn.txHash && (
                                                <div className="w-full md:w-auto mt-3 md:mt-0 flex md:hidden justify-end">
                                                    <a
                                                        href={`https://scan.testnet.monad.xyz/tx/${txn.txHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                                    >
                                                        View on Explorer <ArrowUpRight className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Desktop Hover Action - Absolute Positioned or Overlay (Optional, keeping it simple inline for now) */}
                                        {txn.txHash && (
                                            <a
                                                href={`https://scan.testnet.monad.xyz/tx/${txn.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute top-4 right-4 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
                                                title="View on Explorer"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
