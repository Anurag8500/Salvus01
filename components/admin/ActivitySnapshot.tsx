'use client'

import { motion } from 'framer-motion'
import { Activity, UserPlus, Store, CreditCard, ChevronRight } from 'lucide-react'
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

const SnapshotCard = ({ title, icon: Icon, items, color, link }: { title: string, icon: any, items: ActivityItem[], color: string, link: string }) => (
    <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Icon className={`w-5 h-5 ${color}`} />
                {title}
            </h3>
            <Link href={link} className="text-xs font-medium text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
            </Link>
        </div>
        <div className="space-y-4 flex-1">
            {items.length === 0 ? (
                <div className="text-sm text-gray-500 italic">No recent activity.</div>
            ) : (
                items.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 group cursor-default"
                    >
                        <div className={`mt-0.5 w-1.5 h-1.5 rounded-full ${color} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-1">{item.title}</div>
                            <div className="flex text-xs text-gray-500 justify-between mt-0.5">
                                <span className="line-clamp-1 max-w-[120px]">{item.subtitle}</span>
                                <span>{item.timestamp}</span>
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    </div>
)

export default function ActivitySnapshot({ payments, beneficiaries, vendors }: ActivitySnapshotProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SnapshotCard
                title="Recent Payments"
                icon={CreditCard}
                items={payments}
                color="text-emerald-400"
                link="#"
            />
            <SnapshotCard
                title="Approvals"
                icon={UserPlus}
                items={beneficiaries}
                color="text-blue-400"
                link="#"
            />
            <SnapshotCard
                title="New Vendors"
                icon={Store}
                items={vendors}
                color="text-purple-400"
                link="#"
            />
        </div>
    )
}
