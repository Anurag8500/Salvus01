'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, CheckCircle2, AlertOctagon, Info } from 'lucide-react'
import Link from 'next/link'

export type Priority = 'high' | 'medium' | 'low'

export interface ActionItem {
    id: string
    priority: Priority
    message: string
    campaignName: string
    campaignId: string
    count?: number
    timestamp?: string
}

interface ActionCenterPanelProps {
    actions: ActionItem[]
}

const formatPriority = (p: Priority) => {
    switch (p) {
        case 'high': return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertOctagon };
        case 'medium': return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertTriangle };
        case 'low': return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Info };
    }
}

export default function ActionCenterPanel({ actions }: ActionCenterPanelProps) {
    if (actions.length === 0) {
        return (
            <div className="glass-card rounded-3xl p-8 border border-white/5 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
                <p className="text-gray-400">No pending actions require your immediate attention.</p>
            </div>
        )
    }

    return (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-white">Needs Attention</h2>
                <span className="scrolling-nums px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {actions.length}
                </span>
            </div>

            {/* List */}
            <div className="space-y-3 relative z-10">
                {actions.map((action, i) => {
                    const style = formatPriority(action.priority)
                    const Icon = style.icon

                    return (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border ${style.bg} ${style.border} hover:bg-white/5 transition-all`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 p-1.5 rounded-full ${style.color} bg-black/20`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-200 mb-0.5 group-hover:text-white transition-colors">
                                        {action.message}
                                    </div>
                                    <div className="text-sm text-gray-400 flex items-center gap-2">
                                        <span>{action.campaignName}</span>
                                        {action.timestamp && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                <span>{action.timestamp}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/admin/campaigns/${action.campaignId}`}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-black/20 hover:bg-black/40 border border-white/5 text-sm font-bold text-gray-300 hover:text-white transition-all whitespace-nowrap"
                            >
                                Go to Campaign
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    )
                })}
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[80px] -z-0 pointer-events-none"></div>
        </div>
    )
}
