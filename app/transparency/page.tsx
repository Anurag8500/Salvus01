'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import {
  MapPin, CheckCircle, ArrowRight, Filter, Shield, Building2, Calendar,
  ChevronDown, Search, ArrowDown, Lock, Eye, AlertCircle, Check
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'

type CampaignOption = {
  id: string
  name: string
  location: string
  status: 'Active' | 'Paused' | 'Closed'
  description: string
}

type CampaignSummary = {
  id: string
  name: string
  description: string
  status: string
  location: string
  totalTxns: number
  totalSpent: number
  categories: string[]
  escrowAddress?: string
  chainId?: number | null
  explorerBaseUrl?: string
}

type LedgerItem = {
  id: string
  amount: number
  currency: string
  category: string
  store: string
  timestamp: string
  status: 'Paid'
  txHash: string
}

type AuditLogItem = {
  action: string
  role: 'Admin' | 'System'
  time: string
  detail: string
}


export default function TransparencyPage() {
  const searchParams = useSearchParams()
  const initialCampaignId = searchParams.get('campaign')

  const [campaigns, setCampaigns] = useState<CampaignOption[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [campaignError, setCampaignError] = useState('')

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(initialCampaignId)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filters, setFilters] = useState({ category: '', store: '', date: '' })

  const [summary, setSummary] = useState<CampaignSummary | null>(null)
  const [ledger, setLedger] = useState<LedgerItem[]>([])
  const [auditLog, setAuditLog] = useState<AuditLogItem[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadCampaigns = async () => {
      try {
        setLoadingCampaigns(true)
        const res = await fetch('/api/campaigns')
        if (!res.ok) {
          setCampaignError('Unable to load campaigns')
          return
        }
        const data = await res.json()
        if (!mounted) return
        const mapped: CampaignOption[] = (data || []).map((c: any) => ({
          id: c._id,
          name: c.name,
          location: c.stateRegion || c.location || '',
          status: c.status || 'Active',
          description: c.description || ''
        }))
        setCampaigns(mapped)
      } catch {
        if (!mounted) return
        setCampaignError('Unable to load campaigns')
      } finally {
        if (!mounted) return
        setLoadingCampaigns(false)
      }
    }
    loadCampaigns()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      if (!selectedCampaignId) {
        setSummary(null)
        setLedger([])
        setAuditLog([])
        setFilters({ category: '', store: '', date: '' })
        return
      }
      setDataLoading(true)
      setFilters({ category: '', store: '', date: '' })
      try {
        const [summaryRes, ledgerRes, auditRes] = await Promise.all([
          fetch(`/api/transparency/campaign-summary?campaignId=${encodeURIComponent(selectedCampaignId)}`),
          fetch(`/api/transparency/ledger?campaignId=${encodeURIComponent(selectedCampaignId)}`),
          fetch(`/api/transparency/admin-log?campaignId=${encodeURIComponent(selectedCampaignId)}`)
        ])

        if (summaryRes.ok) {
          const s = await summaryRes.json()
          setSummary({
            id: s.id,
            name: s.name,
            description: s.description,
            status: s.status,
            location: s.location,
            totalTxns: s.totalTxns || 0,
            totalSpent: s.totalSpent || 0,
            categories: Array.isArray(s.categories) ? s.categories : [],
            escrowAddress: s.escrowAddress,
            chainId: s.chainId,
            explorerBaseUrl: s.explorerBaseUrl
          })
        } else {
          setSummary(null)
        }

        if (ledgerRes.ok) {
          const l = await ledgerRes.json()
          const items: LedgerItem[] = (l.items || []).map((p: any) => ({
            id: p.id,
            amount: p.amount,
            currency: p.currency || 'USDC',
            category: p.category || 'Unknown',
            store: p.store || '',
            timestamp: p.timestamp,
            status: 'Paid',
            txHash: p.txHash || ''
          }))
          setLedger(items)
        } else {
          setLedger([])
        }

        if (auditRes.ok) {
          const a = await auditRes.json()
          const logs: AuditLogItem[] = (a.items || []).map((log: any) => ({
            action: log.action,
            role: log.role === 'System' ? 'System' : 'Admin',
            time: new Date(log.time).toLocaleString(),
            detail: log.detail
          }))
          setAuditLog(logs)
        } else {
          setAuditLog([])
        }
      } catch {
        setSummary(null)
        setLedger([])
        setAuditLog([])
      } finally {
        setDataLoading(false)
      }
    }
    loadData()
  }, [selectedCampaignId])

  const selectedCampaign = useMemo(() =>
    campaigns.find(c => c.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId])

  const filteredTxns = useMemo(() => {
    return ledger.filter(t => {
      if (filters.category && t.category !== filters.category) return false
      if (filters.store && !t.store.toLowerCase().includes(filters.store.toLowerCase())) return false
      return true
    })
  }, [ledger, filters])

  const escrowAddress = summary?.escrowAddress || ''
  const hasEscrowAddress = !!escrowAddress

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
            {campaignError && (
              <div className="mb-3 text-sm text-red-400 text-center">
                {campaignError}
              </div>
            )}
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
                    {campaigns.map((c) => (
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
                      <h2 className="text-3xl font-bold text-white">{summary?.name || selectedCampaign.name}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${(summary?.status || selectedCampaign.status) === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                        {summary?.status || selectedCampaign.status}
                      </span>
                    </div>
                    <p className="text-gray-400">{summary?.description || selectedCampaign.description}</p>
                    {hasEscrowAddress && (
                      <div className="mt-3 flex flex-col gap-1">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                          Escrow Contract
                        </span>
                        <span className="font-mono text-xs text-gray-300 break-all">
                          {escrowAddress}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 font-medium">Total Spent</div>
                      <div className="text-2xl font-mono font-bold text-accent">
                        {summary ? `${summary.totalSpent.toLocaleString()} USDC` : '—'}
                      </div>
                    </div>
                    <div className="w-px bg-white/10"></div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 font-medium">Transactions</div>
                      <div className="text-2xl font-mono font-bold text-white">
                        {summary ? summary.totalTxns : '—'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Categories Allowed
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(summary?.categories || []).map(cat => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-200"
                      >
                        <CheckCircle className="w-3 h-3 text-accent" />
                        <span>{cat}</span>
                      </span>
                    ))}
                  </div>
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
                          {(summary?.categories || []).map(c => (
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
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">On-chain Proof</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredTxns.map((t) => (
                          <tr key={t.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-white">
                              {t.amount} {t.currency}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-gray-300">
                                {t.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300 flex items-center gap-2">
                              <span>{t.store}</span>
                              <CheckCircle className="w-3 h-3 text-accent" />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                              {t.timestamp ? new Date(t.timestamp).toLocaleString() : ''}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-green-400 text-xs font-bold uppercase flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Paid
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {t.txHash
                                ? summary?.explorerBaseUrl
                                  ? (
                                    <button
                                      onClick={() =>
                                        window.open(`${summary.explorerBaseUrl}${t.txHash}`, '_blank')
                                      }
                                      className="px-3 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 text-xs transition-colors"
                                    >
                                      View on Explorer
                                    </button>
                                    )
                                  : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-300">
                                      Local Tx (Hardhat)
                                    </span>
                                    )
                                : (
                                  <span className="text-xs text-yellow-400 font-medium">
                                    Proof unavailable
                                  </span>
                                  )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!dataLoading && ledger.length === 0 && (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No transactions have been recorded for this campaign yet.
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-white/5 border-t border-white/5 text-xs text-center text-gray-500">
                    Beneficiary names are masked to protect privacy. All on-chain transactions are immutable.
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
                    {auditLog.map((log, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${log.role === 'System' ? 'bg-accent' : 'bg-purple-500'} ring-4 ring-black`}></div>
                          {i !== auditLog.length - 1 && <div className="w-px h-full bg-white/10 my-1"></div>}
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
                    {auditLog.length === 10 && (
                      <div className="mt-1 text-[11px] text-gray-500">
                        Showing most recent actions
                      </div>
                    )}
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
