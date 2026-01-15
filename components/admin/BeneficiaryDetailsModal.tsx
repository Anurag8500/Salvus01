'use client'

import { motion } from 'framer-motion'
import { XCircle, CheckCircle, AlertTriangle, User, MapPin, Phone, Shield, Clock, FileText, History } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BeneficiaryDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    beneficiaryId?: string
}

export default function BeneficiaryDetailsModal({ isOpen, onClose, beneficiaryId }: BeneficiaryDetailsModalProps) {
    const [data, setData] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchDetails = async () => {
            if (!isOpen || !beneficiaryId) return
            setLoading(true)
            try {
                const res = await fetch(`/api/beneficiaries/${beneficiaryId}`)
                if (!res.ok) throw new Error('Failed to fetch beneficiary details')
                const ben = await res.json()
                setData(ben)
            } catch (err) {
                console.error('Beneficiary details fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchDetails()
    }, [isOpen, beneficiaryId])

    const updateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/beneficiaries/${beneficiaryId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error('Failed to update status')
            setData({ ...data, status: newStatus })
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const [editNotes, setEditNotes] = useState(false)

    if (!isOpen) return null
    if (loading || !data) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
                <div className="glass-card rounded-3xl p-8 text-white">Loading...</div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl glass-card rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-start bg-white/5">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-black text-white tracking-tight">{data.fullName}</h2>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${data.status === 'Approved' ? 'bg-green-500/10 text-green-400' :
                                    data.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                {data.status}
                            </span>
                        </div>
                        <div className="text-sm text-gray-400 font-mono">ID: {data.beneficiaryId || data._id}</div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <XCircle className="w-8 h-8" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">

                    {/* 1. KEY METADATA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Campaign</div>
                            <div className="text-white font-bold">{data.campaignId?.name || 'Campaign'}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Location</div>
                            <div className="text-white font-bold flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-accent" />
                                {data.district || '—'}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Locality</div>
                            <div className="text-white font-bold">{data.locality || '—'}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Risk Profile</div>
                            <div className="text-white font-bold flex items-center gap-2">
                                {data.riskFlags?.length > 0 ? (
                                    <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {data.riskFlags.join(', ')}</span>
                                ) : (
                                    <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Low Risk</span>
                                )}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Vulnerabilities</div>
                            <div className="text-white font-bold">{Array.isArray(data.vulnerabilities) && data.vulnerabilities.length ? data.vulnerabilities.join(', ') : 'None'}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Created</div>
                            <div className="text-white font-mono">{data.createdAt ? new Date(data.createdAt).toLocaleString() : '—'}</div>
                        </div>
                    </div>

                    {/* 2. PERSONAL DETAILS */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-400" /> Personal Identity
                        </h3>
                        <div className="glass-card rounded-xl p-6 border border-white/5 grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                <div className="text-gray-300 font-medium mt-1">{data.fullName}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Age / Gender</label>
                                <div className="text-gray-300 font-medium mt-1">{data.age || data.ageRange || '—'} / {data.gender || '—'}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                <div className="text-gray-300 font-medium mt-1 font-mono">{data.phone || '—'}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                <div className="text-gray-300 font-medium mt-1 font-mono">{data.email || '—'}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">ID Proof</label>
                                <div className="text-gray-300 font-medium mt-1 font-mono">{data.idType || '—'} {data.idNumber ? `(${data.idNumber})` : ''}</div>
                            </div>
                        </div>
                    </div>

                    {/* 3. ADMIN NOTES */}
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-gray-400" /> Internal Notes
                        </h3>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-gray-300">
                            {data.internalNotes && data.internalNotes.trim().length ? data.internalNotes : '—'}
                        </div>
                    </div>

                    {/* 4. HISTORY LOG */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-purple-400" /> Activity Log
                        </h3>
                        <div className="space-y-4 border-l-2 border-white/10 pl-6 relative">
                            {Array.isArray(data.activityLog) && data.activityLog.length ? (
                                data.activityLog.map((log: any, idx: number) => (
                                    <div className="relative" key={idx}>
                                        <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-gray-600"></div>
                                        <div className="text-sm font-bold text-white">{log.action || 'Activity'}</div>
                                        {log.details && <div className="text-xs text-gray-400">{log.details}</div>}
                                        <div className="text-xs text-gray-500">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400">No activity recorded</div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-sm flex justify-end items-center gap-3">
                    {data.status === 'Approved' ? (
                        <button 
                            onClick={() => updateStatus('Suspended')}
                            className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 transition-all"
                        >
                            Suspend Beneficiary
                        </button>
                    ) : (
                        <button 
                            onClick={() => updateStatus('Approved')}
                            className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold transition-all shadow-lg shadow-green-500/20"
                        >
                            Approve Beneficiary
                        </button>
                    )}
                </div>

            </motion.div>
        </div>
    )
}
