'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  BadgeCheck, MapPin, Calendar, CheckCircle, Loader2, Store, CreditCard,
  History, Info, HeartPulse, BusFront, Home, Soup,
  LogOut, User, Settings, Bell, ChevronDown, ShoppingBag, Wallet, AlertCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

export default function BeneficiaryDashboard() {
  const [category, setCategory] = useState('Food')
  const [store, setStore] = useState('') // Store ID
  const [storeName, setStoreName] = useState('') // Store Name for display
  const [amount, setAmount] = useState('0')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [storeOpen, setStoreOpen] = useState(false)

  const [categories, setCategories] = useState<string[]>([])
  const [allStores, setAllStores] = useState<{ id: string; name: string; authorizedCategories: string[] }[]>([])
  const [inventory, setInventory] = useState<{ _id: string; name: string; price: number; unit: string; category: string }[]>([])
  const [cart, setCart] = useState<{ [key: string]: number }>({}) // itemId -> quantity

  const [balances, setBalances] = useState<{ label: string; remaining: number; limit: number }[]>([])
  const [history, setHistory] = useState<{ store: string; category: string; amount: number; date: string; status: string }[]>([])

  const [campaignName, setCampaignName] = useState<string>('Loading...')
  const [campaignLocation, setCampaignLocation] = useState<string>('Loading...')
  const [beneficiaryStatus, setBeneficiaryStatus] = useState<string>('Pending')
  const [approverName, setApproverName] = useState<string>('...')
  const [approvalDate, setApprovalDate] = useState<string>('...')
  const [totalLimit, setTotalLimit] = useState<number>(0)
  const [totalSpent, setTotalSpent] = useState<number>(0)
  const [beneficiaryName, setBeneficiaryName] = useState<string>('')
  const [beneficiaryInitials, setBeneficiaryInitials] = useState<string>('..')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/beneficiaries')
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        const name = data.beneficiary?.fullName || ''
        setBeneficiaryName(name)
        if (name) {
          const parts = name.trim().split(/\s+/)
          const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
          setBeneficiaryInitials(initials.toUpperCase() || (name[0] || '').toUpperCase())
        }
        setCampaignName(data.campaign?.name || '')
        setCampaignLocation(data.campaign?.location || '')
        setBeneficiaryStatus(data.beneficiary?.status || 'Pending')
        setApproverName(data.approver || '')
        if (data.approvalDate) {
          const d = new Date(data.approvalDate)
          const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }
          setApprovalDate(d.toLocaleDateString('en-US', options))
        }
        setCategories(data.categories || [])
        setAllStores(data.stores || [])
        setBalances(data.balances || [])
        setHistory(data.history || [])
        setTotalLimit(data.totalLimit || 0)
        setTotalSpent(data.totalSpent || 0)
        if ((data.categories || []).length > 0) {
          setCategory(data.categories[0])
        }
      } catch (e) {
        console.error('Failed to load beneficiary dashboard data', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const categoryIconMap: Record<string, any> = { Food: Soup, Medicine: HeartPulse, Transport: BusFront, Shelter: Home }

  const filteredStores = allStores.filter(s => s.authorizedCategories?.includes(category))

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setCategoryOpen(false)
    setStore('')
    setStoreName('')
    setInventory([])
    setCart({})
    setAmount('0')
  }

  const handleStoreChange = async (storeId: string, name: string) => {
    setStore(storeId)
    setStoreName(name)
    setStoreOpen(false)
    setInventory([])
    setCart({})
    setAmount('0')

    try {
      const res = await fetch(`/api/inventory?vendorId=${storeId}`)
      if (res.ok) {
        const data = await res.json()
        setInventory(data)
      }
    } catch (error) {
      console.error('Failed to fetch inventory', error)
    }
  }

  const handleQuantityChange = (itemId: string, price: number, delta: number) => {
    setCart(prev => {
      const currentQty = prev[itemId] || 0
      const newQty = Math.max(0, currentQty + delta)
      const newCart = { ...prev, [itemId]: newQty }

      let newTotal = 0
      inventory.forEach(item => {
        const qty = newCart[item._id] || 0
        newTotal += qty * item.price
      })
      setAmount(newTotal.toFixed(2))

      return newCart
    })
  }

  const submitPurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store,
          cart,
          category
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Purchase failed')
      }

      setMessage('Purchase confirmed. You do not need to pay. Salvus pays the store directly.')
      setAmount('0')
      setStore('')
      setStoreName('')
      setCart({})
      setInventory([])

      // Reload dashboard data
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setMessage(err.message || 'Purchase failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 relative overflow-hidden selection:bg-accent/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] z-50 px-6 py-4 glass-nav-high-quality rounded-2xl flex items-center justify-between border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40">
        <div className="flex items-center gap-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">
                SALVUS<span className="text-accent">.</span>
              </h1>
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Beneficiary Portal</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <span className="text-xs font-medium text-gray-300">
              {beneficiaryName ? `Welcome, ${beneficiaryName.split(' ')[0]}` : 'Welcome Back'}
            </span>
          </div>
          <button className="relative p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-black"></span>
          </button>
          <Link href="/" className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto relative z-10 px-6 pt-32 pb-12">

        {/* Header Section */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2"
          >
            Beneficiary <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-blue-400">Dashboard</span>
          </motion.h1>
          <p className="text-gray-400 text-lg">Use your allocated credits for essential supplies.</p>
        </div>

        {/* Campaign & Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="md:col-span-2 relative p-8 rounded-3xl bg-[#111] border border-white/10 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-2">
                  <MapPin className="w-3 h-3" /> {campaignLocation}
                </div>
                <h2 className="text-3xl font-black text-white mb-2">{campaignName}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Store className="w-4 h-4" /> Provider: {approverName}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Approved: {approvalDate}</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold uppercase tracking-wide text-sm ${beneficiaryStatus === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                <CheckCircle className="w-4 h-4" /> {beneficiaryStatus}
              </div>
            </div>
          </div>

          <div className="relative p-8 rounded-3xl bg-[#111] border border-white/10 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Credits</p>
              <div className="text-4xl font-black text-white tracking-tight mb-2">
                ₹{(totalLimit - totalSpent).toLocaleString()}
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalSpent / totalLimit) * 100)}%` }}
                  className="h-full bg-gradient-to-r from-accent to-blue-500"
                ></motion.div>
              </div>
              <div className="flex justify-between mt-2 text-xs font-medium">
                <span className="text-blue-400">Spent: ₹{totalSpent.toLocaleString()}</span>
                <span className="text-gray-500">Limit: ₹{totalLimit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Purchase Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass-card rounded-3xl p-8 border border-white/10 bg-[#0F0F0F] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

              <div className="relative z-10 flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                  <ShoppingBag className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Purchase</h2>
                  <p className="text-gray-400 text-sm">Select verified stores and items to spend your credits.</p>
                </div>
              </div>

              <form onSubmit={submitPurchase} className="space-y-8 relative z-10">
                {/* Selectors */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Category</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setCategoryOpen(!categoryOpen)}
                        className="w-full flex items-center justify-between p-4 bg-[#1A1A1A] border border-white/10 rounded-xl hover:border-accent/50 hover:bg-[#222] transition-all text-left group shadow-lg shadow-black/20"
                      >
                        <span className="flex items-center gap-3 font-medium text-white">
                          {(() => { const Icon = categoryIconMap[category] || BadgeCheck; return <Icon className="w-5 h-5 text-accent" /> })()}
                          {category}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {categoryOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1C] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/50"
                          >
                            {categories.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleCategoryChange(c)}
                                className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left text-gray-300 hover:text-white transition-colors border-b border-white/5 last:border-0"
                              >
                                {c}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Verified Store</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setStoreOpen(!storeOpen)}
                        className={`w-full flex items-center justify-between p-4 bg-[#1A1A1A] border border-white/10 rounded-xl hover:border-accent/50 hover:bg-[#222] transition-all text-left shadow-lg shadow-black/20 ${!store ? 'text-gray-500' : 'text-white'}`}
                      >
                        <span className="flex items-center gap-3 font-medium truncate">
                          <Store className="w-5 h-5 text-gray-500" />
                          {storeName || 'Select Store'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${storeOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {storeOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1C] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar ring-1 ring-black/50"
                          >
                            {filteredStores.length > 0 ? filteredStores.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleStoreChange(s.id, s.name)}
                                className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left text-gray-300 hover:text-white transition-colors border-b border-white/5 last:border-0"
                              >
                                {s.name}
                              </button>
                            )) : (
                              <div className="p-4 text-gray-500 text-xs text-center">No stores in this category</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Inventory List */}
                {store && (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center justify-between">
                      <span>Available Items</span>
                      <span className="text-accent text-[10px] bg-accent/10 px-2 py-1 rounded">VERIFIED INVENTORY</span>
                    </label>

                    {inventory.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {inventory.map(item => (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-[#151515] border border-white/5 hover:border-accent/20 transition-all group shadow-sm"
                          >
                            <div>
                              <div className="font-bold text-white text-base group-hover:text-accent transition-colors">{item.name}</div>
                              <div className="text-xs text-gray-500 mt-1">₹{item.price} / {item.unit}</div>
                            </div>
                            <div className="flex items-center gap-4 bg-black/40 rounded-lg p-1.5 border border-white/5 shadow-inner">
                              <button type="button" onClick={() => handleQuantityChange(item._id, item.price, -1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-lg font-medium">-</button>
                              <span className="w-6 text-center font-bold text-white">{cart[item._id] || 0}</span>
                              <button type="button" onClick={() => handleQuantityChange(item._id, item.price, 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent/20 text-accent transition-colors text-lg font-medium">+</button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                        <Store className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No inventory available for this store.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Total & Action */}
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between mb-6 bg-[#151515] p-5 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-sm font-medium text-gray-400">Total Amount</span>
                    <div className="text-3xl font-black text-white">
                      <span className="text-2xl text-gray-600 mr-1">₹</span>{amount}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={submitPurchase}
                    disabled={loading || parseFloat(amount) <= 0}
                    className="w-full py-5 bg-gradient-to-r from-accent to-accent-dark hover:from-accent-light hover:to-accent text-black font-black text-lg rounded-xl shadow-lg shadow-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform active:scale-[0.99]"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                    <span>{loading ? 'Processing Transaction...' : 'Confirm & Pay Now'}</span>
                  </button>

                  {message && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center font-medium shadow-lg shadow-emerald-500/5">
                      {message}
                    </motion.div>
                  )}
                </div>
              </form>
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Category Limits - REDESIGNED */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-3xl bg-[#111] border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-accent" /> Category Limits
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {balances.length > 0 ? balances.map(b => {
                  const percent = (b.remaining / b.limit) * 100;
                  return (
                    <div key={b.label} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-all relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-3 relative z-10">
                        <div className="p-2 rounded-lg bg-black/40 text-accent">
                          {(() => { const Icon = categoryIconMap[b.label] || BadgeCheck; return <Icon className="w-4 h-4" /> })()}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white capitalize">{b.label}</div>
                          <div className="text-xs text-gray-500">Limit: ₹{b.limit.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">₹{b.remaining.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-400 uppercase">Remaining</div>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden relative z-10">
                        <div
                          className={`h-full rounded-full ${percent < 20 ? 'bg-red-500' : 'bg-gradient-to-r from-accent to-blue-500'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      {/* Subtle Glow Background */}
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-accent/5 rounded-full blur-[40px] group-hover:bg-accent/10 transition-colors"></div>
                    </div>
                  )
                }) : (
                  <p className="text-gray-500 text-sm">No category limits.</p>
                )}
              </div>
            </motion.div>

            {/* Quick History - TIMELINE STYLE */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-3xl bg-[#111] border border-white/10 max-h-[500px] overflow-y-auto custom-scrollbar"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-accent" /> Recent Activity
              </h3>
              {history.length > 0 ? (
                <div className="relative border-l border-white/10 ml-3 space-y-8">
                  {history.map((h, i) => (
                    <div key={i} className="relative pl-6">
                      <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-black border-2 border-accent"></span>
                      <div className="group rounded-xl bg-white/5 border border-white/5 p-4 hover:border-white/10 hover:bg-white/[0.07] transition-all">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-white text-sm truncate">{h.store}</h4>
                          <span className="text-accent font-mono text-sm font-bold">₹{h.amount}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                          <span className="flex items-center gap-1.5">
                            {(() => { const Icon = categoryIconMap[h.category] || ShoppingBag; return <Icon className="w-3 h-3" /> })()}
                            {h.category}
                          </span>
                          <span className="font-mono">{h.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic text-center py-4">No recent transactions to show.</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
