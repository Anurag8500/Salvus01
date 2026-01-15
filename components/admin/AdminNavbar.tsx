'use client'

import Link from 'next/link'
import { Bell, Building2, LogOut, XCircle, Mail, Phone, MapPin, Globe } from 'lucide-react'
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
      } catch {}
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
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 glass-nav border-b border-white/5 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between">
         {/* Logo */}
         <Link href="/admin/dashboard" className="group flex items-center gap-2">
            <div className="text-2xl font-black tracking-tighter text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-blue-400 transition-all duration-300">
              Salvus. <span className="text-xs tracking-widest font-medium text-gray-500 ml-1 uppercase">Admin</span>
            </div>
         </Link>

         {/* Right Actions */}
         <div className="flex items-center gap-4">
            <div ref={orgRef} className="relative hidden md:block">
              <button
                onClick={() => setShowOrg(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                 <Building2 className="w-4 h-4 text-accent" />
                 <span className="text-xs font-bold text-gray-300">{orgName || 'Organisation'}</span>
              </button>
              <AnimatePresence>
                {showOrg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 right-0 w-[26rem] max-w-[80vw] glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-[60]"
                  >
                    <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-accent/20 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-accent" />
                          <div>
                            <div className="text-sm font-black text-white tracking-tight">{org?.name || 'Organisation'}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{org?.type || '-'}</div>
                          </div>
                        </div>
                        <button onClick={() => setShowOrg(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Official Email</div>
                            <div className="text-sm text-gray-200 truncate">{org?.officialEmail || '-'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact Phone</div>
                            <div className="text-sm text-gray-200">{org?.contactPhone || '-'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact Person</div>
                            <div className="text-sm text-gray-200">{org?.contactPersonName || '-'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Website</div>
                            <div className="text-sm text-accent truncate">{org?.website || '-'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Address</div>
                          <div className="text-sm text-gray-200">{org?.address || '-'}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

            <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all relative group">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-all text-sm font-medium">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
            </Link>
         </div>
      </div>
      
    </nav>
  )
}
