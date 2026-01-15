'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import {
  MapPin, CheckCircle, ArrowRight, Filter, Shield, Building2, Calendar,
  ChevronDown, Search, ArrowDown, Lock, Eye, AlertCircle, Check
} from 'lucide-react'

// --- Types ---
type Txn = {
  id: string
  amount: number
  category: 'Food' | 'Medicine' | 'Transport' | 'Shelter'
  store: string
  datetime: string
  status: 'Paid'
}

type AuditLog = {
  action: string
  role: 'Admin' | 'System'
  time: string
  detail: string
}

type Campaign = {
  id: string
  name: string
  location: string
  status: 'Active' | 'Closed'
  description: string
  stats: {
    totalTxns: number
    totalSpent: string
    categories: string[]
  }
}

// --- Mock Data ---
const CAMPAIGNS: Campaign[] = [
  {
    id: 'assam-flood-2025',
    name: 'Assam Flood Relief 2025',
    location: 'Assam, India',
    status: 'Active',
    description: 'Providing immediate food and shelter to 4 districts affected by Brahmaputra floods.',
    stats: { totalTxns: 1242, totalSpent: '42.5 L USDC', categories: ['Food', 'Medicine', 'Transport', 'Shelter'] }
  },
  {
    id: 'kerala-2024',
    name: 'Kerala Recovery Mission',
    location: 'Kerala, India',
    status: 'Active',
    description: 'Rehabilitation support and medical supplies for landslide-affected areas.',
    stats: { totalTxns: 856, totalSpent: '28.2 L USDC', categories: ['Medicine', 'Shelter'] }
  },
  {
    id: 'tn-cyclone',
    name: 'Cyclone Michaung Response',
    location: 'Tamil Nadu, India',
    status: 'Closed',
    description: 'Emergency provisions for Chennai and coastal districts.',
    stats: { totalTxns: 3500, totalSpent: '1.2 Cr USDC', categories: ['Food', 'Medicine', 'Shelter'] }
  },
]

const MOCK_TXNS: Txn[] = [
  { id: 'TX-101', amount: 650, category: 'Food', store: 'Assam Relief Store #1', datetime: '12 Jun 2025, 10:12 AM', status: 'Paid' },
  { id: 'TX-102', amount: 1200, category: 'Medicine', store: 'Northeast Pharma Verified', datetime: '11 Jun 2025, 02:45 PM', status: 'Paid' },
  { id: 'TX-103', amount: 300, category: 'Transport', store: 'Assam Transit Hub', datetime: '10 Jun 2025, 04:05 PM', status: 'Paid' },
  { id: 'TX-104', amount: 950, category: 'Shelter', store: 'Safe Shelter Assam', datetime: '09 Jun 2025, 11:31 AM', status: 'Paid' },
  { id: 'TX-105', amount: 2100, category: 'Food', store: 'Guwahati Provisions', datetime: '12 Jun 2025, 11:20 AM', status: 'Paid' },
]

const MOCK_AUDIT: AuditLog[] = [
  { action: 'Campaign Created', role: 'Admin', time: '01 Jun 2025, 09:00 AM', detail: 'Campaign structure and wallets initialized.' },
  { action: 'Categories Locked', role: 'System', time: '01 Jun 2025, 09:05 AM', detail: 'Spending limited to: Food, Medicine, Shelter.' },
  { action: 'Store Authorized', role: 'Admin', time: '02 Jun 2025, 11:15 AM', detail: 'Assam Relief Store #1 verified and added.' },
  { action: 'Beneficiary Onboarded', role: 'Admin', time: '03 Jun 2025, 02:30 PM', detail: 'Batch #1 of 50 beneficiaries approved.' },
  { action: 'Payment Executed', role: 'System', time: '12 Jun 2025, 10:12 AM', detail: 'Smart contract released 650 USDC to store.' },
]


export default function TransparencyPage() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filters, setFilters] = useState({ category: '', store: '', date: '' })

  const selectedCampaign = useMemo(() =>
    CAMPAIGNS.find(c => c.id === selectedCampaignId),
    [selectedCampaignId])

  const filteredTxns = useMemo(() => {
    return MOCK_TXNS.filter(t => {
      if (filters.category && t.category !== filters.category) return false
      if (filters.store && !t.store.toLowerCase().includes(filters.store.toLowerCase())) return false
      return true
    })
  }, [filters])

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.5, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]"
        />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 container mx-auto px-6 py-12 max-w-5xl"
      >

        {/* Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold uppercase tracking-wider mb-6"
          >
            <Shield className="w-4 h-4" />
            Public Audit Protocol
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-tight">
            Transparency <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">&</span><br />
            <span className="text-white">Active Audit Log.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Track every rupee. Verify every action. Real-time proof of relief operations.
          </p>
        </div>

        {/* STEP 1: CAMPAIGN SELECTOR (Custom Dropdown) */}
        <div className="max-w-2xl mx-auto mb-20 relative z-50">
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="block text-2xl md:text-3xl font-black text-white mb-6 text-center tracking-tight"
          >
            Select a Campaign to View Transparency
          </motion.label>
          <div className="relative">
            {/* Custom Dropdown Trigger */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`relative w-full text-left bg-black/40 border backdrop-blur-xl rounded-2xl py-6 pl-8 pr-16 text-white font-bold text-xl md:text-2xl transition-all shadow-2xl group ${isDropdownOpen ? 'border-accent ring-1 ring-accent/50' : 'border-white/10 hover:border-white/30'
                }`}
            >
              <span className={selectedCampaign ? "text-white" : "text-gray-500"}>
                {selectedCampaign ? `${selectedCampaign.name} (${selectedCampaign.status})` : "Choose Relief Mission..."}
              </span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-accent"
              >
                <ChevronDown className="w-8 h-8" />
              </motion.div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 12, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
                >
                  <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {CAMPAIGNS.map((c) => (
                      <motion.button
                        key={c.id}
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.08)", x: 5 }}
                        onClick={() => {
                          setSelectedCampaignId(c.id)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-left group ${selectedCampaignId === c.id ? 'bg-accent/10' : ''
                          }`}
                      >
                        <div>
                          <div className={`text-lg font-bold ${selectedCampaignId === c.id ? 'text-accent' : 'text-white group-hover:text-white'}`}>
                            {c.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${c.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            {c.status}
                          </div>
                        </div>
                        {selectedCampaignId === c.id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle className="w-6 h-6 text-accent" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  <div className="bg-white/5 p-3 text-xs text-center text-gray-500 border-t border-white/5">
                    Showing all active & closed campaigns
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-sm text-center text-gray-500 font-medium mt-4">Each relief mission has its own unique ledger — select one to reveal its proof.</p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedCampaign ? (
            <motion.div
              key="empty-state"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* GLOBAL SNAPSHOT */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Campaigns Audited", value: "12", icon: Shield },
                  { label: "Verified Stores", value: "148", icon: MapPin },
                  { label: "Transactions Logged", value: "5.2k+", icon: CheckCircle },
                  { label: "Cash Withdrawals", value: "0", icon: Lock, highlight: true },
                ].map((stat, i) => (
                  <motion.div
                    whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.08)" }}
                    key={i}
                    className={`p-6 rounded-3xl border ${stat.highlight ? 'bg-accent/5 border-accent/20' : 'bg-white/5 border-white/5'} text-center backdrop-blur-sm transition-colors`}
                  >
                    <div className="flex justify-center mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.highlight ? 'bg-accent/20 text-accent' : 'bg-white/10 text-gray-400'}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className={`text-3xl font-black mb-1 ${stat.highlight ? 'text-accent' : 'text-white'}`}>{stat.value}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ORIENTATION BLOCK */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-1 bg-gradient-to-r from-transparent to-white rounded-full"></div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">What You'll See Here</h3>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full backdrop-blur-md relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors"></div>
                    <ul className="space-y-6 relative z-10">
                      {[
                        "How donated funds are actually spent",
                        "Which categories are allowed (e.g. Food only)",
                        "Which verified stores receive payments",
                        "A public log of system & admin actions"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(34,197,94,0.5)] shrink-0"></div>
                          <span className="text-lg text-gray-300 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>

                {/* TRUST SIGNALS */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-1 bg-gradient-to-r from-transparent to-accent rounded-full"></div>
                    <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Our Guarantees</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { text: "All transactions are digitally logged", icon: Lock },
                      { text: "Admin actions are publicly visible", icon: Eye },
                      { text: "Payments only to verified vendors", icon: CheckCircle },
                      { text: "Beneficiary privacy is protected", icon: Shield },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all cursor-default"
                      >
                        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shrink-0 border border-white/10 text-accent shadow-lg">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-gray-200 text-lg">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* STATIC FLOW PREVIEW */}
              <motion.div variants={itemVariants} className="pt-8 opacity-40 hover:opacity-100 transition-all duration-700">
                <div className="text-center mb-8">
                  <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    System Architecture
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center px-4 md:px-12">
                  {[
                    { label: "Donor", icon: Building2 },
                    { label: "Campaign", icon: Shield },
                    { label: "Category", icon: Lock },
                    { label: "Store", icon: MapPin },
                    { label: "Paid", icon: CheckCircle },
                  ].map((step, i, arr) => (
                    <div key={i} className="flex flex-col md:flex-row items-center gap-4 w-full group">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center border border-white/10 text-gray-500 group-hover:text-white group-hover:border-white/30 transition-all shadow-xl">
                          <step.icon className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-400 uppercase tracking-widest transition-colors">{step.label}</span>
                      </div>
                      {i !== arr.length - 1 && (
                        <div className="h-10 w-0 md:h-0.5 md:w-full bg-gradient-to-b md:bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/30 transition-all"></div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

            </motion.div>
          ) : (
            <motion.div
              key={selectedCampaign.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-16"
            >

              {/* STEP 2: CAMPAIGN OVERVIEW */}
              <section className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-white">{selectedCampaign.name}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedCampaign.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                        {selectedCampaign.status}
                      </span>
                    </div>
                    <p className="text-gray-400">{selectedCampaign.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 font-medium">Total Spent</div>
                      <div className="text-2xl font-mono font-bold text-accent">{selectedCampaign.stats.totalSpent}</div>
                    </div>
                    <div className="w-px bg-white/10"></div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 font-medium">Transactions</div>
                      <div className="text-2xl font-mono font-bold text-white">{selectedCampaign.stats.totalTxns}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCampaign.stats.categories.map(cat => (
                    <span key={cat} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm text-gray-300">
                      {cat} Only
                    </span>
                  ))}
                </div>
              </section>

              {/* STEP 3: HOW FUNDS MOVE */}
              <section>
                <div className="flex items-center gap-2 mb-6 opacity-80">
                  <div className="w-8 h-1 bg-accent rounded-full"></div>
                  <h3 className="text-sm font-bold text-accent uppercase tracking-wider">System Rules</h3>
                </div>
                <div className="bg-gradient-to-r from-white/5 to-transparent border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Lock className="w-24 h-24 rotate-12" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold text-white mb-8">How Funds Move in this Campaign</h4>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
                      {[
                        { label: "Donor Funds", icon: Building2 },
                        { label: "Campaign Pool", icon: Shield },
                        { label: "Approved Category", icon: Lock },
                        { label: "Verified Store", icon: MapPin },
                        { label: "Digital Payment", icon: CheckCircle },
                      ].map((step, i, arr) => (
                        <div key={i} className="flex flex-col md:flex-row items-center gap-4 w-full">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 text-white shadow-lg">
                              <step.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{step.label}</span>
                          </div>
                          {i !== arr.length - 1 && (
                            <div className="h-8 w-0.5 md:h-0.5 md:w-full bg-white/10 relative">
                              <div className="absolute inset-0 bg-accent/50 w-full h-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
                      <div className="text-sm text-gray-400 flex items-center gap-2 justify-center">
                        <AlertCircle className="w-4 h-4 text-red-400" /> No cash withdrawals allowed
                      </div>
                      <div className="text-sm text-gray-400 flex items-center gap-2 justify-center">
                        <AlertCircle className="w-4 h-4 text-accent" /> Categories strictly enforced
                      </div>
                      <div className="text-sm text-gray-400 flex items-center gap-2 justify-center">
                        <AlertCircle className="w-4 h-4 text-green-400" /> Stores verified before payout
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* STEP 4: TRANSACTION EXPLORER */}
              <section>
                <div className="flex items-center gap-2 mb-6 opacity-80">
                  <div className="w-8 h-1 bg-accent rounded-full"></div>
                  <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Live Ledger</h3>
                </div>

                <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
                  {/* Toolbar */}
                  <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <h4 className="font-bold text-white">Transaction Explorer</h4>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <select
                          value={filters.category}
                          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                          className="pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none appearance-none cursor-pointer hover:bg-white/10"
                        >
                          <option value="" className="bg-dark">All Categories</option>
                          {selectedCampaign.stats.categories.map(c => (
                            <option key={c} value={c} className="bg-dark">{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search store..."
                          value={filters.store}
                          onChange={(e) => setFilters({ ...filters, store: e.target.value })}
                          className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Amount</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Category</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Verified Store</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Timestamp</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredTxns.map((t) => (
                          <tr key={t.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-white">{t.amount} USDC</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-gray-300">
                                {t.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300 flex items-center gap-2">
                              <span>{t.store}</span>
                              <CheckCircle className="w-3 h-3 text-accent" />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{t.datetime}</td>
                            <td className="px-6 py-4">
                              <span className="text-green-400 text-xs font-bold uppercase flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Paid
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredTxns.length === 0 && (
                      <div className="p-8 text-center text-gray-500 text-sm">No transactions match your filters.</div>
                    )}
                  </div>
                  <div className="p-4 bg-white/5 border-t border-white/5 text-xs text-center text-gray-500">
                    Beneficiary names are masked to protect privacy. All transactions are final.
                  </div>
                </div>
              </section>

              {/* STEP 5: SYSTEM & ADMIN TIMELINE */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-6 opacity-80">
                    <div className="w-8 h-1 bg-purple-500 rounded-full"></div>
                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Admin Accountability</h3>
                  </div>
                  <div className="space-y-4">
                    {MOCK_AUDIT.map((log, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${log.role === 'System' ? 'bg-accent' : 'bg-purple-500'} ring-4 ring-black`}></div>
                          {i !== MOCK_AUDIT.length - 1 && <div className="w-px h-full bg-white/10 my-1"></div>}
                        </div>
                        <div className="pb-6">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-white font-bold text-sm">{log.action}</span>
                            <span className="text-xs text-gray-500">{log.time}</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{log.detail}</p>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${log.role === 'System' ? 'border-accent/20 text-accent' : 'border-purple-500/20 text-purple-400'
                            }`}>
                            {log.role} Action
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STEP 6: TRUST SUMMARY */}
                <div>
                  <div className="flex items-center gap-2 mb-6 opacity-80">
                    <div className="w-8 h-1 bg-white rounded-full"></div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trust Assessment</h3>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                    {[
                      { text: "Funds cannot be diverted to cash", icon: CheckCircle },
                      { text: "Purchases limited to essentials", icon: CheckCircle },
                      { text: "Stores verified before payment", icon: CheckCircle },
                      { text: "Admin actions are visible & logged", icon: CheckCircle },
                      { text: "Transactions are immutable", icon: Lock },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-green-500" />
                        </div>
                        <span className="text-gray-300 font-medium">{item.text}</span>
                      </div>
                    ))}

                    <div className="mt-8 pt-6 border-t border-white/10">
                      <p className="text-sm text-gray-500 leading-relaxed">
                        This transparency report is generated automatically by the Salvus protocol. It represents the unfiltered state of the relief campaign.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

            </motion.div>
          )}
        </AnimatePresence>

      </motion.main>
    </div>
  )
}
