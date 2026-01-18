'use client'

import { motion } from 'framer-motion'
import { Activity, UserPlus, Store, CreditCard, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
    id: string
    title: string
    subtitle: string
    timestamp: string
    icon: any
    type: 'payment' | 'beneficiary' | 'vendor'
    campaignId?: string
}

interface ActivitySnapshotProps {
    payments: ActivityItem[]
    beneficiaries: ActivityItem[]
    vendors: ActivityItem[]
}

const SnapshotCard = ({ title, icon: Icon, items, color, link, delay }: { title: string, icon: any, items: ActivityItem[], color: string, link: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#111] rounded-3xl p-6 border border-white/5 flex flex-col h-full relative overflow-hidden group hover:border-white/10 transition-all"
    >
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <Icon className="w-24 h-24" />
        </div>

        <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-white/5 border border-white/5 ${color.replace('text-', 'text-')}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {title}
            </h3>
            <Link href={link} className="p-2 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                <ChevronRight className="w-5 h-5" />
            </Link>
        </div>

        <div className="space-y-0 relative z-10">
            {items.length === 0 ? (
                <div className="text-sm text-gray-500 italic py-4 text-center border border-dashed border-white/10 rounded-xl">No recent activity.</div>
            ) : (
                items.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay + (i * 0.1) }}
                        className="flex items-start gap-4 py-4 border-b border-white/[0.03] last:border-0 group/item hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
                    >
                        <div className="text-xs font-mono text-gray-600 mt-1 w-12 shrink-0 flex flex-col items-center">
                            <span>{item.timestamp}</span>
                            <div className="w-0.5 h-full bg-white/5 mt-1 rounded-full group-hover/item:bg-white/10 transition-colors h-6"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-200 group-hover/item:text-white transition-colors truncate">
                                {item.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 truncate">
                                {item.subtitle}
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    </motion.div>
)

export default function ActivitySnapshot({ payments, beneficiaries, vendors }: ActivitySnapshotProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SnapshotCard
                title="Transactions"
                icon={CreditCard}
                items={payments}
                color="text-emerald-400"
                link="#"
                delay={0.1}
            />
            <SnapshotCard
                title="Approvals"
                icon={UserPlus}
                items={beneficiaries}
                color="text-blue-400"
                link="#"
                delay={0.2}
            />
            <SnapshotCard
                title="New Vendors"
                icon={Store}
                items={vendors}
                color="text-purple-400"
                link="#"
                delay={0.3}
            />
        </div>
    )
}
