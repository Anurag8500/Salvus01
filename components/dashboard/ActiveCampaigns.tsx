'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, AlertCircle, Clock, TrendingUp, Eye, Heart, Utensils, Pill, Car, Home, ShieldCheck, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ActiveCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch Active Campaigns from backend
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/campaigns')
        if (!res.ok) throw new Error('Failed to load campaigns')
        const data = await res.json()
        if (!mounted) return
        const mapped = (data || []).filter((c: any) => c.status === 'Active').map((c: any) => ({
          id: c._id,
          name: c.name,
          location: c.stateRegion || c.location || '',
          description: c.description || '',
          urgency: c.urgency || 'High',
          fundsAllocated: c.fundsRaised || 0,
          target: c.totalFundsAllocated || 0,
          categories: c.categories || [],
          // Add visual helpers based on urgency
          urgencyColor: c.urgency === 'High' ? 'text-red-400' : c.urgency === 'Medium' ? 'text-amber-400' : 'text-blue-400',
          urgencyBg: c.urgency === 'High' ? 'bg-red-500/10' : c.urgency === 'Medium' ? 'bg-amber-500/10' : 'bg-blue-500/10',
          urgencyBorder: c.urgency === 'High' ? 'border-red-500/20' : c.urgency === 'Medium' ? 'border-amber-500/20' : 'border-blue-500/20',
        }))
        setCampaigns(mapped)
      } catch (e: any) {
        setError(e?.message || 'Unable to fetch campaigns')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food': return Utensils
      case 'Medicine': return Pill
      case 'Transport': return Car
      case 'Shelter': return Home
      default: return Heart
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'High': return AlertCircle
      case 'Medium': return Clock
      default: return TrendingUp
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent" />
            Active Relief Campaigns
          </h2>
          <p className="text-gray-400 text-sm mt-1">Directly fund verified relief efforts.</p>
        </div>
        {/* Optional: 'View All' link if needed */}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-64 rounded-2xl glass-card animate-pulse bg-white/5"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-medium py-12 glass-card rounded-2xl">{error}</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center text-gray-400 py-12 glass-card rounded-2xl">
          <p>No active campaigns available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign, index) => {
            const progress = campaign.target > 0 ? (campaign.fundsAllocated / campaign.target) * 100 : 0;
            const UrgencyIcon = getUrgencyIcon(campaign.urgency)

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative flex flex-col rounded-3xl border border-white/5 bg-[#0F0F0F] hover:bg-[#141414] hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 overflow-hidden"
              >
                {/* Decorative Gradient Blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full filter blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="p-6 flex flex-col h-full relative z-10">
                  {/* Header: Location & Urgency */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{campaign.location}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${campaign.urgencyBorder} ${campaign.urgencyBg} ${campaign.urgencyColor}`}>
                      <UrgencyIcon className="w-3 h-3" />
                      {campaign.urgency} Priority
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div className="mb-6 flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-accent transition-colors">
                      {campaign.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-end mb-2 relative z-10">
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Raised</div>
                        <div className="text-lg font-bold text-white">{campaign.fundsAllocated.toLocaleString()} <span className="text-xs font-normal text-gray-500">USDC</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 mb-0.5">Target</div>
                        <div className="text-sm font-semibold text-gray-300">{campaign.target.toLocaleString()} <span className="text-xs font-normal text-gray-500">USDC</span></div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-700/30 rounded-full overflow-hidden mb-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-accent rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </motion.div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-accent">{progress.toFixed(1)}% Funded</span>
                    </div>
                  </div>

                  {/* Categories & Actions */}
                  <div className="flex items-center justify-between gap-4 mt-auto">
                    <div className="flex -space-x-2 overflow-hidden">
                      {campaign.categories.slice(0, 3).map((cat: string, i: number) => {
                        const CatIcon = getCategoryIcon(cat);
                        return (
                          <div key={i} className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-gray-400" title={cat}>
                            <CatIcon className="w-4 h-4" />
                          </div>
                        )
                      })}
                      {campaign.categories.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[10px] text-gray-400 font-medium">
                          +{campaign.categories.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link
                        href={`/transparency?campaign=${encodeURIComponent(campaign.id)}`}
                        className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="View Audit"
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </Link>

                      <button
                        onClick={() => {
                          sessionStorage.setItem('selectedCampaignId', campaign.id)
                          sessionStorage.setItem('selectedCampaignName', campaign.name)
                          const donateSection = document.getElementById('donate-section')
                          if (donateSection) {
                            donateSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-dark text-dark-darker font-bold rounded-lg transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40 text-sm whitespace-nowrap"
                      >
                        <span>Donate</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

