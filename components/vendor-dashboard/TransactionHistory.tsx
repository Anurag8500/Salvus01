import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';

type Txn = {
    id: string
    campaign: string
    amount: number
    date: string
    status: 'Pending' | 'Completed' | 'Failed' | 'Paid'
    category?: string
}

const TransactionHistory = ({ transactions }: { transactions: Txn[] }) => {
    return (
        <div className="glass-card rounded-2xl p-6 md:p-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Recent Transactions</h2>
                    <p className="text-gray-400 text-sm">Track your payments and campaign fulfillments</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-sm text-accent hover:bg-accent/20 transition-colors">
                        <ArrowDownLeft className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                            <th className="px-6 py-4 font-semibold">Transaction ID</th>
                            <th className="px-6 py-4 font-semibold">Campaign / Category</th>
                            <th className="px-6 py-4 font-semibold">Amount</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map((txn, idx) => (
                            <motion.tr
                                key={txn.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="hover:bg-white/[0.02] transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-emerald-500/10 text-emerald-400`}>
                                            <ArrowDownLeft className="w-4 h-4" />
                                        </div>
                                        <span className="font-mono text-sm text-gray-300 group-hover:text-accent transition-colors">{txn.id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{txn.campaign}</div>
                                    {txn.category && <div className="text-xs text-gray-500 mt-0.5">{txn.category}</div>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono font-bold text-white">{txn.amount.toLocaleString()} USDC</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {txn.date}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${txn.status === 'Completed' || txn.status === 'Paid'
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : txn.status === 'Pending'
                                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                        }`}>
                                        {(txn.status === 'Completed' || txn.status === 'Paid') && <CheckCircle className="w-3 h-3" />}
                                        {txn.status === 'Pending' && <Clock className="w-3 h-3" />}
                                        {txn.status === 'Failed' && <XCircle className="w-3 h-3" />}
                                        {txn.status}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionHistory;
