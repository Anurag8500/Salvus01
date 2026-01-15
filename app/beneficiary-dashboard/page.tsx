'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BadgeCheck, MapPin, Calendar, CheckCircle, Loader2, Store, CreditCard,
  History, Info, HeartPulse, BusFront, Home, Soup,
  LogOut, User, Settings, Bell
} from 'lucide-react'
import { useEffect, useState } from 'react'

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

  const progressPercent = (remaining: number, limit: number) => Math.min(100, Math.round((remaining / limit) * 100))
  const categoryIconMap: Record<string, any> = { Food: Soup, Medicine: HeartPulse, Transport: BusFront, Shelter: Home }
  const totalRemaining = balances.reduce((sum, b) => sum + b.remaining, 0)
  const totalPercentRemaining = Math.min(100, Math.round((totalRemaining / totalLimit) * 100))

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
      
      // Reload dashboard data to update balances and history
      // We can reload the page or re-fetch. Reloading page is simplest for now.
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
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 glass-nav border-b border-white/5">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="text-2xl font-black tracking-tighter text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-blue-400 transition-all duration-300">
              Salvus.
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all relative group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 transition-all group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center text-dark-darker font-bold text-sm shadow-lg shadow-accent/20">
                {beneficiaryInitials}
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white hidden sm:block">{beneficiaryName || 'Beneficiary'}</span>
            </button>

            <Link href="/" className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 lg:px-12 py-12 pt-28 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            Beneficiary <span className="text-accent">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Your approved relief, safely and respectfully.
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden"
        >
          {/* Header Row with Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{campaignName}</h2>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{campaignLocation}</span>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${beneficiaryStatus === 'Approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.3)]'} self-start md:self-auto`}>
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wide">Status: {beneficiaryStatus}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="p-2 rounded-lg bg-white/5 text-accent"><Store className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-gray-400">Approver</div>
                  <div className="font-bold text-white">{approverName || 'Organisation'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="p-2 rounded-lg bg-white/5 text-accent"><Calendar className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-gray-400">Approval Date</div>
                  <div className="font-bold text-white">{approvalDate}</div>
                </div>
              </div>
            </div>

            <div className="md:text-right">
              <div className="text-xs text-accent mb-1 uppercase tracking-wider font-bold">Available Limit</div>
              <div className="text-3xl font-black text-white">
                <span className="text-accent">{(totalLimit - totalSpent).toLocaleString()} USDC</span>
                <span className="text-gray-500 text-lg font-medium ml-1">/ {totalLimit.toLocaleString()} USDC</span>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Allowed Categories & Limits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-4">Allowed Categories</h3>
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.length > 0 ? categories.map(cat => (
                <div key={cat} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300">
                  {(() => { const Icon = categoryIconMap[cat] || BadgeCheck; return <Icon className="w-4 h-4 text-accent" /> })()}
                  <span>{cat}</span>
                </div>
              )) : (
                <div className="text-gray-500">No specific categories listed.</div>
              )}
            </div>

            <div className="space-y-4">
              <div className="border-t border-white/10 pt-6">
                <div className="mb-4">
                  <div className="text-lg font-bold text-white">Category Spending Limits</div>
                  <div className="text-sm text-gray-400">(not additive, per category caps)</div>
                </div>

                <div className="space-y-3">
                  {balances.length > 0 ? balances.map(b => {
                    const spent = Math.max(0, (b.limit || 0) - (b.remaining || 0))
                    return (
                      <div key={b.label} className="grid grid-cols-2 max-w-sm items-center py-1">
                        <span className="text-gray-300 font-medium capitalize">{b.label}</span>
                        <span className="text-right font-mono text-gray-200">
                          <span className="text-gray-500">{spent.toLocaleString()} USDC</span>
                          <span className="mx-2 text-gray-600">/</span>
                          <span>{b.limit.toLocaleString()} USDC</span>
                        </span>
                      </div>
                    )
                  }) : <div className="text-gray-500">No category limits defined.</div>}
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
                <span className="text-lg">ℹ️</span>
                <div className="space-y-1">
                  <div className="text-gray-200 font-medium">You cannot exceed <span className="text-accent font-bold">{totalLimit.toLocaleString()} USDC</span> in total.</div>
                  <div className="text-sm text-gray-400">Category limits only restrict spending within each category.</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Purchase Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 glass-card rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-full bg-accent/10 border border-accent/20 text-accent">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Purchase Essentials</h2>
                <p className="text-gray-400 text-sm">Use your credits at verified stores only.</p>
              </div>
            </div>

            <form onSubmit={submitPurchase} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Select */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <button
                    type="button"
                    onClick={() => setCategoryOpen(!categoryOpen)}
                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = categoryIconMap[category] || BadgeCheck
                        return <Icon className="w-5 h-5 text-accent" />
                      })()}
                      <span className="font-semibold">{category}</span>
                    </div>
                    <div className="text-gray-400">▼</div>
                  </button>

                  {categoryOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d24] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                      {categories.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleCategoryChange(c)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors"
                        >
                          <div className="text-accent">
                            {(() => { const I = categoryIconMap[c] || BadgeCheck; return <I className="w-4 h-4" /> })()}
                          </div>
                          <span className="text-gray-200 font-medium">{c}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Store Select */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Verified Store</label>
                  <button
                    type="button"
                    onClick={() => setStoreOpen(!storeOpen)}
                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-gray-400" />
                      <span className={store ? "font-semibold" : "text-gray-400"}>{storeName || "Select Store"}</span>
                    </div>
                    <div className="text-gray-400">▼</div>
                  </button>

                  {storeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d24] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto">
                      {filteredStores.length > 0 ? filteredStores.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleStoreChange(s.id, s.name)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-white/5 text-left transition-colors"
                        >
                          <Store className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-200 font-medium">{s.name}</span>
                        </button>
                      )) : (
                        <div className="p-4 text-gray-500 text-sm">No stores found for this category</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory Selection */}
              {store && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-accent" />
                    Select Items
                  </h3>

                  {inventory.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {inventory.map(item => (
                        <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                          <div>
                            <div className="font-medium text-white">{item.name}</div>
                            <div className="text-sm text-gray-400">{item.price} USDC / {item.unit}</div>
                          </div>

                          <div className="flex items-center gap-3 bg-black/30 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item._id, item.price, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-white">{cart[item._id] || 0}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item._id, item.price, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-accent hover:text-accent-light transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-xl bg-white/5 border border-white/5 border-dashed text-gray-500">
                      No items available in this store.
                    </div>
                  )}
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount to Pay</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">USDC</span>
                  <input
                    type="text"
                    readOnly
                    value={amount}
                    className="w-full pl-4 pr-16 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-lg focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all placeholder-gray-600 cursor-not-allowed opacity-80"
                    placeholder="0.00"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                    Calculated automatically
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={loading || parseFloat(amount) <= 0 || !store}
                type="submit"
                className="w-full py-4 bg-accent hover:bg-accent-dark text-dark-darker font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                <span>Confirm Purchase</span>
              </motion.button>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-center font-medium"
                >
                  {message}
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                Recent History
              </h3>
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-white">{h.store}</div>
                      <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 font-bold border border-green-500/20">PAID</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-sm text-gray-400">{h.category} • {h.date}</div>
                      <div className="text-accent font-bold">{h.amount} USDC</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-accent" />
                Quick Rules
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-accent"></span>
                  Essentials buying only (Food, Meds, Shelter)
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-accent"></span>
                  No cash withdrawals allowed
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 mt-2 rounded-full bg-accent"></span>
                  Misuse leads to immediate suspension
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
