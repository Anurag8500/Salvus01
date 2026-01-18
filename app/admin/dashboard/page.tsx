'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Shield, Flag, Users, Store as StoreIcon, ClipboardList, Eye, Settings,
  CheckCircle, PauseCircle, XCircle, Building2, Calendar, Plus,
  Bell, LogOut, Search, Filter, AlertTriangle, AlertOctagon, TrendingUp, CreditCard, UserPlus, Store, Activity, MapPin
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

      // 1. Stats Cards
      const statsWithUI = [
        {
          ...data.stats[0],
          icon: ClipboardList,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          color: 'text-blue-500'
        },
        {
          ...data.stats[1],
          icon: Users,
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          color: 'text-emerald-500'
        },
        {
          ...data.stats[2],
          icon: StoreIcon,
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
          color: 'text-purple-500'
        },
        {
          ...data.stats[3],
          icon: Flag,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          color: 'text-red-500'
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
      setRecentPayments((data.recentActivity.payments || []).map((p: any) => ({
        id: p._id,
        title: `${(p.amountNumber || 0).toLocaleString()} USDC to ${p.vendorName || 'Vendor'}`,
        subtitle: `${p.category || 'General'} • ${p.campaignName || 'Campaign'}`,
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
    <div className="min-h-screen relative overflow-hidden bg-[#050505] text-gray-200 font-sans selection:bg-accent/30">

      {/* Dynamic Background */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '2s' }}></div>
      </div>

      {orgRequired && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-xl bg-[#0F0F0F] rounded-3xl overflow-hidden flex flex-col max-h-[85vh] border border-white/10 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
            <div className="px-8 py-8 border-b border-white/5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <Building2 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Setup Organisation</h2>
                  <p className="text-gray-400 text-sm mt-1">Configure your profile to access the command center.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Organisation Name</label>
                  <input
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium placeholder:text-gray-600 focus:bg-[#1A1A1A]"
                    placeholder="e.g. Salvus Relief Foundation"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Type</label>
                  <div className="relative">
                    <select
                      value={orgForm.type}
                      onChange={(e) => setOrgForm({ ...orgForm, type: e.target.value })}
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium appearance-none focus:bg-[#1A1A1A]"
                    >
                      <option value="" disabled>Select Type</option>
                      <option value="NGO">Non-Governmental Org (NGO)</option>
                      <option value="Govt">Government Entity</option>
                      <option value="Trust">Charitable Trust</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Official Email</label>
                  <input
                    type="email"
                    value={orgForm.officialEmail}
                    onChange={(e) => setOrgForm({ ...orgForm, officialEmail: e.target.value })}
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium placeholder:text-gray-600 focus:bg-[#1A1A1A]"
                    placeholder="admin@org.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Website</label>
                  <input
                    value={orgForm.website}
                    onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium placeholder:text-gray-600 focus:bg-[#1A1A1A]"
                    placeholder="https://"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Contact Person</label>
                  <input
                    value={orgForm.contactPersonName}
                    onChange={(e) => setOrgForm({ ...orgForm, contactPersonName: e.target.value })}
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium placeholder:text-gray-600 focus:bg-[#1A1A1A]"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Phone</label>
                  <input
                    value={orgForm.contactPhone}
                    onChange={(e) => setOrgForm({ ...orgForm, contactPhone: e.target.value })}
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium placeholder:text-gray-600 focus:bg-[#1A1A1A]"
                    placeholder="+91..."
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Registered Address</label>
                <input
                  value={orgForm.address}
                  onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                  className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium placeholder:text-gray-600 focus:bg-[#1A1A1A]"
                  placeholder="Full Address"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 bg-[#0F0F0F] flex justify-end relative z-10">
              <button onClick={submitOrg} className="px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-light text-black font-black transition-all shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]">
                Initialize Console
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminNavbar />

      <div className="container mx-auto px-6 lg:px-8 py-12 pt-32 relative z-10 space-y-10">

        {/* SECTION 1: PLATFORM OVERVIEW */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-500">Dashboard</span>
              </h1>
              <p className="text-gray-400 text-lg font-medium">Real-time platform monitoring and management system.</p>
            </div>
            <div className="flex gap-3">
              <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors backdrop-blur-md group">
                <Search className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
              <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors backdrop-blur-md group">
                <Filter className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
              <button className="p-3 bg-accent/10 hover:bg-accent/20 rounded-xl border border-accent/20 transition-colors backdrop-blur-md group">
                <Settings className="w-5 h-5 text-accent group-hover:rotate-45 transition-transform duration-500" />
              </button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <EnhancedStatCard key={i} {...s} delay={i * 0.1} onClick={() => { }} />
            ))}
          </div>
        </div>

        {/* SECTION 2: MAIN WORKSPACE (Campaigns + Actions + Activity) */}
        <div className="space-y-8">

          {/* CAMPAIGNS HUB */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0F0F0F] border border-white/10 rounded-3xl overflow-hidden relative"
          >
            <div className="p-8 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 bg-[#141414]">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <ClipboardList className="w-5 h-5 text-accent" />
                </div>
                Active Campaigns
              </h2>
              <button
                onClick={() => setShowCampaignCreate(true)}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-accent transition-all shadow-lg hover:shadow-accent/20 active:scale-95"
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                <span>New Campaign</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              {campaigns.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#111] text-gray-500 text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="px-8 py-5 border-b border-white/5">Details</th>
                      <th className="px-6 py-5 border-b border-white/5">Status</th>
                      <th className="px-6 py-5 border-b border-white/5">Engagement</th>
                      <th className="px-6 py-5 border-b border-white/5">Health Check</th>
                      <th className="px-8 py-5 border-b border-white/5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {campaigns.map((c, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-5">
                          <div className="font-bold text-white group-hover:text-accent transition-colors text-base mb-1">{c.name}</div>
                          <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5 uppercase tracking-wide">
                            <MapPin className="w-3 h-3" /> {c.location}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></span>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-xs text-gray-300" title="Beneficiaries">
                              <Users className="w-3.5 h-3.5 text-blue-400" /> <span className="font-mono">{c.beneficiaries}</span> beneficiaries
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-300" title="Vendors">
                              <StoreIcon className="w-3.5 h-3.5 text-purple-400" /> <span className="font-mono">{c.vendors}</span> vendors
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {c.issues > 0 ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {c.issues} ALERTS
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-emerald-500 text-xs font-bold opacity-60 group-hover:opacity-100 transition-opacity">
                              <CheckCircle className="w-4 h-4" /> Systems Check OK
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Link
                            href={`/admin/campaigns/${c.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all text-sm font-bold"
                          >
                            <span>Manage Campaign</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Active Campaigns</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6">Start a new relief operation to begin monitoring and managing resources.</p>
                  <button
                    onClick={() => setShowCampaignCreate(true)}
                    className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-light text-black font-bold transition-all"
                  >
                    Create First Campaign
                  </button>
                </div>
              )}
            </div>
          </motion.section>

          {/* ACTION CENTER - Moved below campaigns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ActionCenterPanel actions={actionItems} />
          </motion.div>

          {/* ACTIVITY FEED */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 px-1">
              <Activity className="w-5 h-5 text-accent" />
              Live Data Feeds
            </h2>
            <ActivitySnapshot
              payments={recentPayments}
              beneficiaries={recentBeneficiaries}
              vendors={recentVendors}
            />
          </motion.section>

        </div>

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
