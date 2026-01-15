'use client'

import { motion } from 'framer-motion'
import { XCircle, CheckCircle, AlertTriangle, Store, MapPin, Phone, Shield, FileText, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'

interface VendorDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    vendorId?: string
}

export default function VendorDetailsModal({ isOpen, onClose, vendorId }: VendorDetailsModalProps) {
    const [data, setData] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchDetails = async () => {
            if (!isOpen || !vendorId) return
            setLoading(true)
            try {
                const res = await fetch(`/api/vendors/${vendorId}`)
                if (!res.ok) throw new Error('Failed to fetch vendor details')
                const v = await res.json()
                setData(v)
            } catch (err) {
                console.error('Vendor details fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchDetails()
    }, [isOpen, vendorId])

    const updateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/vendors/${vendorId}`, {
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
                            <h2 className="text-2xl font-black text-white tracking-tight">{data.name}</h2>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${data.status === 'Verified' ? 'bg-green-500/10 text-green-400' :
                                data.status === 'Pending' ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                {data.status}
                            </span>
                        </div>
                        <div className="text-sm text-gray-400 font-mono">ID: {data.storeId || data._id}</div>
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
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Vendor Type</div>
                            <div className="text-white font-bold">{data.category || data.type}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total Paid</div>
                            <div className="text-white font-mono font-bold text-accent">{(data.totalPaid || 0).toLocaleString()} USDC</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Compliance</div>
                            <div className="text-white font-bold flex items-center gap-2">
                                <Shield className="w-3 h-3 text-green-400" /> {data.businessProofType || '—'}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Business Proof Number</div>
                            <div className="text-white font-mono">{data.businessProofNumber || '—'}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Risk Flags</div>
                            <div className="text-white">{Array.isArray(data.riskFlags) && data.riskFlags.length ? data.riskFlags.join(', ') : 'None'}</div>
                        </div>
                    </div>

                    {/* 2. BUSINESS DETAILS */}
                    <div className="glass-card rounded-xl p-6 border border-white/5 grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Authorized Contact</label>
                            <div className="text-gray-300 font-medium mt-1">{data.contactPerson || '—'}</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone & Location</label>
                            <div className="text-gray-300 font-medium mt-1">{data.phone || '—'}</div>
                            <div className="text-gray-500 text-xs mt-1">{data.area ? `${data.area}, ${data.district || ''}` : data.district || '—'}</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <div className="text-gray-300 font-medium mt-1 font-mono">{data.email || '—'}</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">System Generated ID</label>
                            <div className="text-gray-300 font-mono mt-1">{data.storeId || data._id}</div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Wallet Address</label>
                            <div className="text-gray-300 font-mono mt-1 break-all">
                                {data.walletAddress || <span className="text-red-400">Not Linked</span>}
                            </div>
                        </div>
                    </div>

                    {/* 3. SELLING RULES */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-purple-400" /> Authorized Selling Rules
                        </h3>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Allowed Categories</div>
                            <div className="text-white">{Array.isArray(data.authorizedCategories) && data.authorizedCategories.length ? data.authorizedCategories.join(', ') : 'None'}</div>
                        </div>
                    </div>

                    {/* 4. INTERNAL NOTES */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" /> Internal Notes
                        </h3>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-gray-300">
                            {data.notes && data.notes.trim().length ? data.notes : '—'}
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
                            Suspend Vendor
                        </button>
                    ) : (
                        <div className="flex flex-col items-end gap-1">
                            {!data.walletAddress && (
                                <span className="text-xs text-red-400 font-bold">Wallet Address Required</span>
                            )}
                            <button
                                onClick={() => updateStatus('Approved')}
                                disabled={!data.walletAddress}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
                                    !data.walletAddress 
                                    ? 'bg-gray-600/20 text-gray-500 cursor-not-allowed shadow-none' 
                                    : 'bg-green-500 hover:bg-green-400 text-black shadow-green-500/20'
                                }`}
                            >
                                Approve Vendor
                            </button>
                        </div>
                    )}
                </div>

            </motion.div>
        </div>
    )
}
