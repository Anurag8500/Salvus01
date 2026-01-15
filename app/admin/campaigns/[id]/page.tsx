'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    ArrowLeft, Users, Store as StoreIcon, Shield, CheckCircle,
    Settings, Search, Filter, Plus, FileText, CreditCard, AlertTriangle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import AdminNavbar from '@/components/admin/AdminNavbar'
import OnboardBeneficiaryModal from '@/components/admin/OnboardBeneficiaryModal'
import AddVendorModal from '@/components/admin/AddVendorModal'
import BeneficiaryDetailsModal from '@/components/admin/BeneficiaryDetailsModal'
import VendorDetailsModal from '@/components/admin/VendorDetailsModal'

export default function CampaignDetails() {
    const params = useParams()
    const campaignId = params.id as string

    const [campaign, setCampaign] = useState<any>(null)
    const [beneficiaries, setBeneficiaries] = useState<any[]>([])
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [orgName, setOrgName] = useState<string>('')

    const [activeTab, setActiveTab] = useState<'beneficiaries' | 'vendors' | 'settings'>('beneficiaries')
    const [showOnboardModal, setShowOnboardModal] = useState(false)
    const [showVendorModal, setShowVendorModal] = useState(false)

    // Details Modal State
    const [selectedBen, setSelectedBen] = useState<string | null>(null)
    const [selectedVendor, setSelectedVendor] = useState<string | null>(null)

    const fetchCampaignData = async () => {
        try {
            const res = await fetch(`/api/campaigns/${campaignId}`)
            if (!res.ok) throw new Error('Failed to fetch campaign')
            const data = await res.json()

            setCampaign({
                ...data,
                funds: `${(data.totalFundsAllocated || 0).toLocaleString()} USDC`, // Format currency
                stats: data.stats
            })

            setBeneficiaries(data.beneficiaries.map((b: any) => ({
                id: b.beneficiaryId || b._id,
                name: b.fullName,
                status: b.status,
                verified: b.status === 'Approved', // Derive verified
                location: data.location, // Fallback to campaign location if not specific
                risk: b.riskLevel
            })))

            setVendors(data.vendors.map((v: any) => ({
                id: v.storeId || v._id,
                name: v.name,
                type: v.category,
                status: v.status,
                paid: `${(v.totalPaid || 0).toLocaleString()} USDC`,
                location: data.location,
                risk: v.riskLevel
            })))

        } catch (error) {
            console.error('Error fetching campaign details:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchOrg = async () => {
        try {
            const res = await fetch('/api/organisation')
            if (!res.ok) return
            const data = await res.json()
            if (data?.name) setOrgName(data.name)
        } catch { }
    }

    useEffect(() => {
        if (campaignId) {
            fetchCampaignData()
        }
    }, [campaignId])

    useEffect(() => {
        fetchOrg()
    }, [])

    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
    }

    if (!campaign) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Campaign not found</div>
    }


    return (
        <div className="min-h-screen relative overflow-hidden bg-black text-gray-200">
            {/* Background (Same as Dashboard) */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
            </div>

            <AdminNavbar />

            <div className="container mx-auto px-6 lg:px-12 py-12 pt-28 relative z-10">

                {/* Back navigation */}
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </Link>

                {/* Campaign Context Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="glass-card rounded-3xl p-8 mb-8 border border-white/5 relative overflow-hidden"
                >
                    {/* Decor */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-gray-300 border border-white/5 uppercase tracking-wider">
                                    {campaignId}
                                </span>
                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${campaign.status === 'Active' ? 'text-green-400 bg-green-500/10' : 'text-gray-400 bg-gray-500/10'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${campaign.status === 'Active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                                    {campaign.status}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                                {campaign.name}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-400 text-sm">
                                <span className="flex items-center gap-1"><Shield className="w-4 h-4" />Managed by {orgName || 'Organisation'}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                <span>{campaign.location}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="text-sm text-gray-400">Total Funds Allocated</div>
                            <div className="text-3xl font-mono font-bold text-accent">{campaign.funds}</div>
                        </div>
                    </div>
                </motion.div>

                {/* --- TABS --- */}
                <div className="flex items-center gap-6 border-b border-white/10 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('beneficiaries')}
                        className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-colors relative ${activeTab === 'beneficiaries' ? 'text-accent' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <Users className="w-4 h-4" />
                        Beneficiaries
                        {activeTab === 'beneficiaries' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('vendors')}
                        className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-colors relative ${activeTab === 'vendors' ? 'text-accent' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <StoreIcon className="w-4 h-4" />
                        Vendors / Stores
                        {activeTab === 'vendors' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-colors relative ${activeTab === 'settings' ? 'text-accent' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <Settings className="w-4 h-4" />
                        Settings
                        {activeTab === 'settings' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                    </button>
                </div>

                {/* --- TAB CONTENT --- */}

                {/* BENEFICIARIES TAB */}
                {activeTab === 'beneficiaries' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                    <input type="text" placeholder="Search by ID..." className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50 w-64" />
                                </div>
                            </div>
                            <button
                                onClick={() => setShowOnboardModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Onboard Beneficiary</span>
                            </button>
                        </div>

                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Location</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Risk</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {beneficiaries.map((b) => (
                                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-mono">{b.id}</td>
                                            <td className="px-6 py-4 text-gray-300 font-bold">{b.name}</td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">{b.location}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${b.status === 'Approved' ? 'text-green-400 bg-green-500/10' :
                                                    b.status === 'Pending' ? 'text-yellow-400 bg-yellow-500/10' :
                                                        'text-red-400 bg-red-500/10'
                                                    }`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {b.risk === 'High' && (
                                                    <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                                                        <AlertTriangle className="w-3 h-3" /> High
                                                    </span>
                                                )}
                                                {b.risk === 'Medium' && (
                                                    <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                                        <AlertTriangle className="w-3 h-3" /> Med
                                                    </span>
                                                )}
                                                {b.risk === 'Low' && <span className="text-green-500/80 text-xs font-bold">Low</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedBen(b.id)}
                                                    className="text-sm font-medium text-accent hover:text-white"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {beneficiaries.length === 0 && (
                                <div className="p-8 text-center text-gray-500">No beneficiaries found within this campaign.</div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* VENDORS TAB */}
                {activeTab === 'vendors' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                    <input type="text" placeholder="Search vendors..." className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50 w-64" />
                                </div>
                            </div>
                            <button
                                onClick={() => setShowVendorModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Vendor</span>
                            </button>
                        </div>
                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Vendor Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Category</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Location</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Total Paid</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Risk</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {vendors.map((v) => (
                                        <tr key={v.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-bold">{v.name}</td>
                                            <td className="px-6 py-4 text-gray-300">{v.type}</td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">{v.location}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${(v.status === 'Verified' || v.status === 'Approved') ? 'text-green-400 bg-green-500/10' :
                                                        (v.status === 'Pending') ? 'text-yellow-400 bg-yellow-500/10' :
                                                            'text-red-400 bg-red-500/10'
                                                    }`}>
                                                    {(v.status === 'Verified' || v.status === 'Approved') && <CheckCircle className="w-3 h-3" />}
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-gray-300">{v.paid}</td>
                                            <td className="px-6 py-4">
                                                {v.risk === 'High' && (
                                                    <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                                                        <AlertTriangle className="w-3 h-3" /> High
                                                    </span>
                                                )}
                                                {v.risk === 'Medium' && (
                                                    <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                                        <AlertTriangle className="w-3 h-3" /> Med
                                                    </span>
                                                )}
                                                {v.risk === 'Low' && <span className="text-green-500/80 text-xs font-bold">Low</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedVendor(v.id)}
                                                    className="text-sm font-medium text-accent hover:text-white"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <div className="glass-card rounded-2xl p-8 border border-white/5">
                            <h3 className="text-xl font-bold text-white mb-6">Campaign Controls</h3>
                            <div className="space-y-6 max-w-2xl">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <div className="font-bold text-gray-200">Pause Logic</div>
                                        <div className="text-sm text-gray-500">Temporarily stop new beneficiary signups.</div>
                                    </div>
                                    <button className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 text-sm font-bold text-gray-300">Pause</button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <div className="font-bold text-red-400">Close Campaign</div>
                                        <div className="text-sm text-gray-500">Permanently stop all activity. Cannot be undone.</div>
                                    </div>
                                    <button className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-sm font-bold text-red-500">Close Campaign</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence>
                    {showOnboardModal && (
                        <OnboardBeneficiaryModal
                            isOpen={showOnboardModal}
                            onClose={() => setShowOnboardModal(false)}
                            campaignLocation={campaign.location}
                            campaignId={campaign._id}
                            onSuccess={fetchCampaignData}
                        />
                    )}
                    {showVendorModal && (
                        <AddVendorModal
                            isOpen={showVendorModal}
                            onClose={() => setShowVendorModal(false)}
                            campaignLocation={campaign.location}
                            campaignCategories={Array.isArray(campaign.categories) ? campaign.categories : []}
                            campaignId={campaign._id}
                            onSuccess={fetchCampaignData}
                        />
                    )}
                    {selectedBen && (
                        <BeneficiaryDetailsModal
                            isOpen={!!selectedBen}
                            onClose={() => setSelectedBen(null)}
                            beneficiaryId={selectedBen}
                        />
                    )}
                    {selectedVendor && (
                        <VendorDetailsModal
                            isOpen={!!selectedVendor}
                            onClose={() => setSelectedVendor(null)}
                            vendorId={selectedVendor}
                        />
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}
