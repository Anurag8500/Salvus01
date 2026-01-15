'use client'

import { motion } from 'framer-motion'
import { LucideIcon, ChevronRight } from 'lucide-react'

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
            className={`glass-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${borderColor} border`}
        >
            {/* Background Icon Decoration */}
            <div className="absolute -top-6 -right-6 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity rotate-12">
                <Icon className={`w-32 h-32 ${color}`} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center border ${borderColor}`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    {onClick && (
                        <div className="bg-white/5 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    )}
                </div>

                <div className="mb-1">
                    <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
                    <p className="text-sm font-medium text-gray-400">{label}</p>
                </div>

                {/* Breakdown Stats */}
                {breakdown && breakdown.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                        {breakdown.map((item, i) => (
                            <div key={i} className="text-center">
                                <div className={`text-xs font-bold ${item.color}`}>{item.value}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{item.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Hover visual cue */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </motion.div>
    )
}
