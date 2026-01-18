'use client'

import Link from 'next/link'
import { Bell, Building2, LogOut, XCircle, Mail, Phone, MapPin, Globe, Menu, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export default function AdminNavbar() {
  const [orgName, setOrgName] = useState<string>('')
  const [org, setOrg] = useState<any>(null)
  const [showOrg, setShowOrg] = useState(false)
  const orgRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadOrg = async () => {
      try {
        const res = await fetch('/api/organisation')
        if (!res.ok) return
        const data = await res.json()
        if (!isMounted) return
        setOrg(data)
        setOrgName(data?.name || '')
      } catch { }
    }
    loadOrg()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!orgRef.current) return
      const target = e.target as Node
      if (!orgRef.current.contains(target)) {
        setShowOrg(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 transition-all duration-300 backdrop-blur-xl bg-black/40 border-b border-white/5 supports-[backdrop-filter]:bg-black/20">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/admin/dashboard" className="group flex items-center gap-2 relative">
          <div className="absolute -inset-2 bg-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div className="relative text-2xl font-black tracking-tighter text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-blue-400 transition-all duration-300">
            Salvus. <span className="text-xs tracking-widest font-bold text-gray-500 ml-1 uppercase border border-gray-700/50 rounded-md px-1.5 py-0.5 group-hover:border-accent/50 group-hover:text-accent font-mono transition-all">Admin_Dashboard</span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div ref={orgRef} className="relative hidden md:block">
            <button
              onClick={() => setShowOrg(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${showOrg ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
            >
              <Building2 className={`w-4 h-4 transition-colors ${showOrg ? 'text-accent' : 'text-gray-400'}`} />
              <span className="text-xs font-bold text-gray-200 max-w-[150px] truncate">{orgName || 'Organisation'}</span>
              <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${showOrg ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showOrg && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "circOut" }}
                  className="absolute top-full mt-3 right-0 w-[28rem] max-w-[90vw] bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60] ring-1 ring-white/5"
                >
                  <div className="px-6 py-5 border-b border-white/5 bg-gradient-to-r from-accent/10 to-transparent relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Building2 className="w-24 h-24 text-accent rotate-12" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-black/40 rounded-xl border border-white/10 backdrop-blur-sm">
                          <Building2 className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <div className="text-base font-black text-white tracking-tight">{org?.name || 'Organisation'}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{org?.type || 'Entity'}</div>
                        </div>
                      </div>
                      <button onClick={() => setShowOrg(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 relative">
                    {/* Grid Pattern Background */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">Email</div>
                          <div className="text-xs text-gray-300 truncate font-mono">{org?.officialEmail || '-'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">Phone</div>
                          <div className="text-xs text-gray-300 truncate font-mono">{org?.contactPhone || '-'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">Contact</div>
                          <div className="text-xs text-gray-300 truncate">{org?.contactPersonName || '-'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">Website</div>
                          <div className="text-xs text-accent truncate hover:underline">{org?.website || '-'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors relative z-10">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">Address</div>
                        <div className="text-xs text-gray-300 leading-relaxed">{org?.address || '-'}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

          <button className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all relative group">
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-all text-sm font-bold group">
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden md:inline">Logout</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
