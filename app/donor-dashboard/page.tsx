'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { LogOut, User, Settings, Bell, FileText } from 'lucide-react'
import DonorOverview from '@/components/dashboard/DonorOverview'
import ActiveCampaigns from '@/components/dashboard/ActiveCampaigns'
import DonateSection from '@/components/dashboard/DonateSection'
import DonationHistory from '@/components/dashboard/DonationHistory'
import ImpactBreakdown from '@/components/dashboard/ImpactBreakdown'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const WalletConnect = dynamic(() => import('@/components/WalletConnect'), {
  ssr: false,
})

export default function DonorDashboard() {
  const [userName, setUserName] = useState('')
  const [initials, setInitials] = useState('..')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/auth/login')
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        const name = data?.user?.name || ''
        setUserName(name)
        if (name) {
          const parts = name.trim().split(/\s+/)
          const init = (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
          setInitials(init.toUpperCase() || (name[0] || '').toUpperCase())
        }
      } catch {}
    }
    load()
    return () => { mounted = false }
  }, [])
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
            {/* Wallet Connect */}
            <WalletConnect apiEndpoint="/api/link-wallet" />

            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all relative group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <div className="absolute top-full right-0 mt-2 w-48 p-2 rounded-xl glass-card text-xs text-gray-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                2 updates on your campaigns
              </div>
            </button>

            {/* Tax Reports */}
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-accent hover:bg-accent/10 border border-transparent hover:border-accent/20 transition-all">
              <FileText className="w-4 h-4" />
              <span>Tax Report</span>
            </button>

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            {/* Profile */}
            <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 transition-all group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center text-dark-darker font-bold text-sm shadow-lg shadow-accent/20">
                {initials}
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white hidden sm:block">{userName || 'Donor'}</span>
            </button>

            {/* Settings Dropdown Placeholder */}
            <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <Settings className="w-5 h-5" />
            </button>

            {/* Logout */}
            <Link href="/" className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 lg:px-12 py-12 pt-28 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Donor <span className="text-accent">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Track your impact, manage donations, and see exactly where your help goes.
          </p>
        </motion.div>

        {/* Donor Overview Panel */}
        <DonorOverview />

        {/* Active Relief Campaigns */}
        <div className="mt-12">
          <ActiveCampaigns />
        </div>

        {/* Donate to a Campaign - Full Width */}
        <div className="mt-8" id="donate-section">
          <DonateSection />
        </div>

        {/* Impact Breakdown - Below Donate Section */}
        <div className="mt-8">
          <ImpactBreakdown />
        </div>

        {/* Donation History */}
        <DonationHistory />
      </div>
    </div>
  )
}

