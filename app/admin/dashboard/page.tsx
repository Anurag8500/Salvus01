'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Shield, Flag, Users, Store as StoreIcon, ClipboardList, Eye, Settings,
  CheckCircle, PauseCircle, XCircle, Building2, Calendar, Plus,
  Bell, LogOut, Search, Filter, AlertTriangle, AlertOctagon, TrendingUp, CreditCard, UserPlus, Store
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import AdminNavbar from '@/components/admin/AdminNavbar'
import EnhancedStatCard from '@/components/admin/EnhancedStatCard'
import ActionCenterPanel, { ActionItem } from '@/components/admin/ActionCenterPanel'
import ActivitySnapshot from '@/components/admin/ActivitySnapshot'
import CreateCampaignModal from '@/components/admin/CreateCampaignModal'

export default function AdminDashboard() {
  const [showCampaignCreate, setShowCampaignCreate] = useState(false)

  const [stats, setStats] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [recentBeneficiaries, setRecentBeneficiaries] = useState<any[]>([])
  const [recentVendors, setRecentVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [orgRequired, setOrgRequired] = useState(false)
  const [orgForm, setOrgForm] = useState({
    name: '',
    type: '',
    officialEmail: '',
    contactPersonName: '',
    contactPhone: '',
    address: '',
    website: '',
  })

  const fetchStats = async () => {
    try {
      const orgRes = await fetch('/api/organisation')
      if (orgRes.status === 404) {
        setOrgRequired(true)
        setLoading(false)
        return
      }
      if (!orgRes.ok) throw new Error('Failed to fetch organisation')
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()

      // 1. Stats Cards (Add icons/colors which aren't in API)
      const statsWithUI = [
        {
          ...data.stats[0],
          icon: ClipboardList,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          color: 'text-blue-400'
        },
        {
          ...data.stats[1],
          icon: Users,
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          color: 'text-green-400'
        },
        {
          ...data.stats[2],
          icon: StoreIcon,
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
          color: 'text-purple-400'
        },
        {
          ...data.stats[3],
          icon: Flag,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          color: 'text-red-400'
        }
      ]
      setStats(statsWithUI)

      // 2. Campaigns
      setCampaigns(data.campaigns.map((c: any) => ({
        id: c._id,
        name: c.name,
        location: c.location,
        status: c.status,
        beneficiaries: c.beneficiaries,
        vendors: c.vendors,
        issues: c.issues
      })))

      // 3. Action Items
      setActionItems(data.actionItems)

      // 4. Recent Activity
      setRecentPayments(data.recentActivity.payments.map((p: any) => ({
        id: p._id,
        title: `${p.amount} USDC to ${p.vendorId?.name || 'Unknown'}`,
        subtitle: `${p.category} - ${p.campaignId?.name || 'General'}`,
        timestamp: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: CreditCard,
        type: 'payment'
      })))

      setRecentBeneficiaries(data.recentActivity.beneficiaries.map((b: any) => ({
        id: b._id,
        title: `${b.fullName} added`,
        subtitle: b.campaignId?.name || 'General',
        timestamp: new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: UserPlus,
        type: 'beneficiary'
      })))

      setRecentVendors(data.recentActivity.vendors.map((v: any) => ({
        id: v._id,
        title: `${v.name} verified`,
        subtitle: v.campaignId?.name || 'General',
        timestamp: new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: Store,
        type: 'vendor'
      })))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const submitOrg = async () => {
    if (!orgForm.name || !orgForm.type || !orgForm.officialEmail || !orgForm.contactPersonName || !orgForm.contactPhone || !orgForm.address) {
      alert('Please fill all mandatory fields')
      return
    }
    try {
      const res = await fetch('/api/organisation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgForm),
      })
      if (!res.ok) throw new Error('Failed to save organisation')
      setOrgRequired(false)
      setLoading(true)
      fetchStats()
    } catch (e) {
      alert('Error saving organisation details')
    }
  }

  // --- RENDER ---

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-gray-200">
      {orgRequired && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl glass-card rounded-3xl overflow-hidden flex flex-col max-h-[85vh] border border-white/10 shadow-2xl">
            <div className="px-8 py-6 border-b border-white/5 bg-gradient-to-r from-accent/20 to-transparent">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-black text-white tracking-tight">Organisation Profile</h2>
              </div>
              <p className="text-gray-400 text-sm mt-1">One-time setup required to access admin dashboard.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Organisation Name</label>
                  <input
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
                    placeholder="e.g. Salvus Relief Foundation"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Organisation Type</label>
                  <select
                    value={orgForm.type}
                    onChange={(e) => setOrgForm({ ...orgForm, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
                  >
                    <option value="" disabled>Select</option>
                    <option value="NGO" className="bg-dark-darker">NGO</option>
                    <option value="Govt" className="bg-dark-darker">Govt</option>
                    <option value="Trust" className="bg-dark-darker">Trust</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Official Email</label>
                  <input
                    type="email"
                    value={orgForm.officialEmail}
                    onChange={(e) => setOrgForm({ ...orgForm, officialEmail: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
                    placeholder="org@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Website</label>
                  <input
                    value={orgForm.website}
                    onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
                    placeholder="https://example.org"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Contact Person Name</label>
                  <input
                    value={orgForm.contactPersonName}
                    onChange={(e) => setOrgForm({ ...orgForm, contactPersonName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Contact Phone</label>
                  <input
                    value={orgForm.contactPhone}
                    onChange={(e) => setOrgForm({ ...orgForm, contactPhone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Address / Location</label>
                <input
                  value={orgForm.address}
                  onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
                  placeholder="Address"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-sm flex justify-end">
              <button onClick={submitOrg} className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-dark text-dark-darker font-bold transition-all shadow-lg shadow-accent/20">Save & Continue</button>
            </div>
          </div>
        </div>
      )}
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      <AdminNavbar />

      <div className="container mx-auto px-6 lg:px-12 py-12 pt-28 relative z-10 space-y-12">

        {/* SECTION 1: PLATFORM OVERVIEW */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                Admin <span className="text-accent">Dashboard</span>
              </h1>
              <p className="text-gray-400 text-lg">Platform-wide health and status overview.</p>
            </div>
            <div className="flex gap-3">
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
                <Search className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
                <Filter className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <EnhancedStatCard key={i} {...s} delay={i * 0.1} onClick={() => { }} />
            ))}
          </div>
        </div>

        {/* SECTION 3: RELIEF CAMPAIGNS HUB */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-accent" />
              Relief Campaigns
            </h2>
            <button
              onClick={() => setShowCampaignCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-dark-darker font-bold transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40"
            >
              <Plus className="w-5 h-5" />
              <span>Create New</span>
            </button>
          </div>

          <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Stats</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Health</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaigns.map((c, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white group-hover:text-accent transition-colors text-lg">{c.name}</div>
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3" /> {c.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4 text-sm text-gray-300">
                          <div className="flex items-center gap-1.5" title="Beneficiaries">
                            <Users className="w-4 h-4 text-blue-400" /> {c.beneficiaries}
                          </div>
                          <div className="flex items-center gap-1.5" title="Vendors">
                            <StoreIcon className="w-4 h-4 text-purple-400" /> {c.vendors}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {c.issues > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {c.issues} Issues
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-green-400 text-xs font-bold">
                            <CheckCircle className="w-4 h-4" /> Healthy
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/campaigns/${c.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white text-gray-300 border border-white/10 transition-all font-bold text-sm"
                        >
                          <span>Manage Campaign</span>
                          <Settings className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* SECTION 2: ADMIN ACTION CENTER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <ActionCenterPanel actions={actionItems} />
        </motion.div>

        {/* SECTION 4: PLATFORM ACTIVITY SNAPSHOT */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            Platform Activity Snapshot
          </h2>
          <ActivitySnapshot
            payments={recentPayments}
            beneficiaries={recentBeneficiaries}
            vendors={recentVendors}
          />
        </motion.section>

      </div>

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showCampaignCreate && (
          <CreateCampaignModal
            isOpen={showCampaignCreate}
            onClose={() => setShowCampaignCreate(false)}
            onSuccess={fetchStats}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
