'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { LogOut, Bell, FileText, Settings, User } from 'lucide-react' // Added User and Settings back if needed, though mostly using Custom Profile
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
      } catch { }
    }
    load()
    return () => { mounted = false }
  }, [])
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0A0A] selection:bg-accent/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-top"></div>
        {/* Colorful Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow delay-700"></div>
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[90px] mix-blend-screen opacity-50"></div>
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl glass-nav-high-quality rounded-2xl border border-white/5 shadow-2xl shadow-black/20">
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="text-2xl font-black tracking-tighter text-white">
              Salvus<span className="text-accent">.</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Wallet Connect */}
            <div className="scale-90 md:scale-100 origin-right">
              <WalletConnect apiEndpoint="/api/link-wallet" />
            </div>

            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

            {/* Notifications */}
            <button className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all relative group hidden sm:block">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-[#0A0A0A]"></span>
              <div className="absolute top-full right-0 mt-2 w-64 p-3 rounded-xl glass-card border-white/10 text-xs text-gray-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity translate-y-2 group-hover:translate-y-0">
                <div className="font-semibold text-white mb-1">Notifications</div>
                <div>2 updates on your campaigns</div>
              </div>
            </button>

            {/* Tax Reports */}
            <button className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
              <FileText className="w-4 h-4" />
              <span>Tax Report</span>
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-white leading-tight">{userName || 'Donor'}</div>
                <div className="text-[10px] font-medium text-accent uppercase tracking-wider">Verified Donor</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-blue-600 p-[2px] shadow-lg shadow-accent/20">
                <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-sm">{initials}</span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <Link href="/" className="ml-2 p-2.5 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all" title="Logout">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 lg:px-8 py-12 pt-32 relative z-10 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 tracking-tight">
              Donor <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-purple-400 animate-gradient-x">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-light">
              Track your impact, manage donations, and see the change you make.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="px-5 py-2 rounded-full glass-card border border-accent/20 flex items-center gap-2 text-accent/80 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              System Operational
            </div>
          </motion.div>
        </div>

        {/* Dashboard Grid Content */}
        <div className="space-y-12">
          {/* 1. Overview Cards */}
          <section>
            <DonorOverview />
          </section>

          {/* 2. Active Relief Campaigns */}
          <section>
            <ActiveCampaigns />
          </section>

          {/* 3. Make a Difference (Donate Section) */}
          <section id="donate-section" className="scroll-mt-32">
            <DonateSection />
          </section>

          {/* 4. Real-World Impact */}
          <section>
            <ImpactBreakdown />
          </section>

          {/* 5. Recent Activity (History) */}
          <section>
            <DonationHistory />
          </section>
        </div>
      </div>
    </div>
  )
}


