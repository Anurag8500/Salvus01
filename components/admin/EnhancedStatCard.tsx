'use client'

import { motion } from 'framer-motion'
import { LucideIcon, ChevronRight, TrendingUp } from 'lucide-react'

interface StatBreakdown {
    label: string
    value: number
    color: string
}

interface EnhancedStatCardProps {
    icon: LucideIcon
    label: string
    value: number | string
    color: string
    bgColor: string
    borderColor: string
    breakdown?: StatBreakdown[]
    onClick?: () => void
    delay?: number
}

export default function EnhancedStatCard({
    icon: Icon,
    label,
    value,
    color,
    bgColor,
    borderColor,
    breakdown,
    onClick,
    delay = 0
}: EnhancedStatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            onClick={onClick}
            className={`relative overflow-hidden rounded-3xl p-6 group cursor-pointer transition-all duration-500 hover:scale-[1.02] bg-[#0F0F0F] border border-white/5 hover:border-white/10`}
        >
            {/* Ambient Glow */}
            <div className={`absolute -inset-1 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${bgColor.replace('/10', '/30')}`}></div>

            {/* Futuristic Grid Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>

            {/* Background Icon Decoration */}
            <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover:opacity-10 transition-all duration-500 hover:rotate-12 transform scale-150">
                <Icon className={`w-32 h-32 ${color}`} />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center border ${borderColor} shadow-inner group-hover:shadow-${color.split('-')[1]}-500/20 transition-all`}>
                        <Icon className={`w-7 h-7 ${color}`} />
                    </div>
                    {onClick && (
                        <div className="bg-white/5 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 border border-white/5 hover:bg-white/10">
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-4xl font-black text-white tracking-tighter mb-1.5">{value}</h3>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        {label}
                    </p>
                </div>

                {/* Breakdown Stats */}
                {breakdown && breakdown.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-dashed border-white/10 grid grid-cols-3 gap-3">
                        {breakdown.map((item, i) => (
                            <div key={i} className="text-center group/item hover:bg-white/5 rounded-lg py-1 transition-colors relative">
                                <div className={`text-sm font-black ${item.color} mb-0.5`}>{item.value}</div>
                                <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{item.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Border Line */}
            <div className={`absolute bottom-0 left-0 w-full h-1 ${bgColor.replace('/10', '')} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
        </motion.div>
    )
}
