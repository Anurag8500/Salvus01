'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, CheckCircle2, AlertOctagon, Info, Zap } from 'lucide-react'
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
        case 'high': return { color: 'text-red-400', bg: 'bg-red-500/[0.08]', border: 'border-red-500/20', badge: 'bg-red-500 text-white', icon: AlertOctagon };
        case 'medium': return { color: 'text-orange-400', bg: 'bg-orange-500/[0.08]', border: 'border-orange-500/20', badge: 'bg-orange-500 text-white', icon: AlertTriangle };
        case 'low': return { color: 'text-blue-400', bg: 'bg-blue-500/[0.08]', border: 'border-blue-500/20', badge: 'bg-blue-500 text-white', icon: Info };
    }
}

export default function ActionCenterPanel({ actions }: ActionCenterPanelProps) {
    if (actions.length === 0) {
        return (
            <div className="glass-card-premium rounded-3xl p-8 border border-white/5 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 relative z-10">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Systems Nominal</h3>
                <p className="text-gray-400 font-medium">No pending actions. Platform is operational.</p>
            </div>
        )
    }

    return (
        <div className="bg-[#0F0F0F] rounded-3xl p-1 border border-white/10 relative overflow-hidden shadow-2xl">
            {/* Header Layer */}
            <div className="bg-[#141414] rounded-t-[22px] p-6 md:p-8 relative z-10 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 shadow-inner">
                            <Zap className="w-6 h-6 text-red-500 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Mission Control</h2>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                                {actions.length} items require attention
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Layer */}
            <div className="p-6 md:p-8 space-y-4 bg-gradient-to-b from-[#0F0F0F] to-black rounded-b-[22px]">
                {actions.map((action, i) => {
                    const style = formatPriority(action.priority)
                    const Icon = style.icon

                    return (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border ${style.bg} ${style.border} hover:bg-white/[0.02] transition-all relative overflow-hidden`}
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${action.priority === 'high' ? 'bg-red-500' : action.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>

                            <div className="flex items-start gap-5">
                                <Link href={`/admin/campaigns/${action.campaignId}`} className="group/icon">
                                    <div className={`mt-1 p-2.5 rounded-xl bg-black/40 ${style.border} border shadow-lg group-hover/icon:scale-110 transition-transform`}>
                                        <Icon className={`w-5 h-5 ${style.color}`} />
                                    </div>
                                </Link>
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${style.badge}`}>
                                            {action.priority}
                                        </span>
                                        <span className="text-xs text-gray-500 font-mono">
                                            {action.timestamp || 'Just now'}
                                        </span>
                                    </div>
                                    <div className="font-bold text-gray-100 text-lg group-hover:text-white transition-colors">
                                        {action.message}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1 font-medium">
                                        target: <span className="text-gray-300">{action.campaignName}</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/admin/campaigns/${action.campaignId}`}
                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0A0A0A] hover:bg-white/5 border border-white/10 hover:border-white/20 text-sm font-bold text-gray-300 hover:text-white transition-all whitespace-nowrap group/btn shadow-lg"
                            >
                                Investigate
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
