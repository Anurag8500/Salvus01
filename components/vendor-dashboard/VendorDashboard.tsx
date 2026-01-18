'use client';

import React, { useEffect, useState } from 'react';
import VendorProfile from './VendorProfile';
import InventoryManagement from './InventoryManagement';
import TransactionHistory from './TransactionHistory';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, DollarSign, LogOut, TrendingUp, Store, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const WalletConnect = dynamic(() => import('@/components/WalletConnect'), {
    ssr: false,
});

const VendorDashboard = () => {
    const [vendor, setVendor] = useState<any | null>(null)
    const [stats, setStats] = useState<{ itemsListed: number; totalOrders: number; paymentsReceived: number }>({ itemsListed: 0, totalOrders: 0, paymentsReceived: 0 })
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const res = await fetch('/api/vendor-dashboard')
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}))
                    throw new Error(errData.message || 'Failed to load vendor dashboard')
                }
                const data = await res.json()
                if (!mounted) return
                setVendor(data.vendor)
                setStats(data.stats)
                setTransactions(data.transactions)
            } catch (e: any) {
                console.error(e)
                setError(e.message || 'Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-gray-200 relative overflow-hidden selection:bg-accent/30">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="max-w-[1400px] mx-auto relative z-10 px-6 pb-20">
                {/* Floating Navigation */}
                <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] z-50 px-6 py-4 glass-nav-high-quality rounded-2xl flex items-center justify-between border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                            <Store className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-white leading-none">
                                SALVUS<span className="text-accent">.</span>
                            </h1>
                            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Vendor Portal</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-300">Live & Operational</span>
                        </div>
                        <WalletConnect apiEndpoint="/api/vendor/link-wallet" />
                        <Link href="/" className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>
                </nav>

                <div className="pt-32"></div>

                {/* Dashboard Header */}
                <div className="mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2"
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                                Dashboard
                            </span>
                        </motion.h1>
                        <p className="text-gray-400 text-lg">
                            Welcome back, <span className="text-white font-semibold">{vendor?.storeName || 'Vendor'}</span>. Here's your store's performance.
                        </p>
                    </div>
                    {vendor?.verified && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            <span className="font-bold text-sm tracking-wide">VERIFIED MERCHANT</span>
                        </motion.div>
                    )}
                </div>

                {/* Custom Vibrant Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="group relative p-6 rounded-3xl bg-[#111] border border-white/5 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Inventory</p>
                                <h3 className="text-4xl font-black text-white tracking-tight">{stats.itemsListed}</h3>
                                <p className="text-blue-400 text-xs font-medium mt-2 flex items-center gap-1">
                                    <Package className="w-3 h-3" /> Active Listings
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-300">
                                <Package className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="group relative p-6 rounded-3xl bg-[#111] border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Fulfillment</p>
                                <h3 className="text-4xl font-black text-white tracking-tight">{stats.totalOrders}</h3>
                                <p className="text-emerald-400 text-xs font-medium mt-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Completed Orders
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="group relative p-6 rounded-3xl bg-[#111] border border-white/5 overflow-hidden hover:border-purple-500/30 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Earnings</p>
                                <h3 className="text-4xl font-black text-white tracking-tight">
                                    <span className="text-2xl align-top text-gray-500 mr-1">₹</span>
                                    {(stats.paymentsReceived || 0).toLocaleString()}
                                </h3>
                                <p className="text-purple-400 text-xs font-medium mt-2 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> Total Revenue
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform duration-300">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <InventoryManagement allowedCategories={vendor?.allowedCategories || []} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-1"
                    >
                        <div className="sticky top-28">
                            {loading ? (
                                <div className="glass-card rounded-3xl p-6 h-[400px] animate-pulse bg-white/5 border border-white/5"></div>
                            ) : error ? (
                                <div className="glass-card rounded-3xl p-6 border-red-500/20 bg-red-500/5 text-red-400">
                                    Error loading profile
                                </div>
                            ) : vendor ? (
                                <VendorProfile vendor={vendor} />
                            ) : (
                                <div className="glass-card rounded-3xl p-6 text-center text-gray-400">No profile data</div>
                            )}
                        </div>
                    </motion.div>
                </div>

                <TransactionHistory transactions={transactions} />
            </div>
        </div>
    );
};

export default VendorDashboard;
