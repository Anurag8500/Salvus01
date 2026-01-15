'use client';

import React, { useEffect, useState } from 'react';
import VendorProfile from './VendorProfile';
import InventoryManagement from './InventoryManagement';
import TransactionHistory from './TransactionHistory';
import EnhancedStatCard from '../admin/EnhancedStatCard';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, DollarSign, LogOut } from 'lucide-react';
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
        <div className="min-h-screen bg-dark-darker text-gray-200 p-4 md:p-8 relative overflow-hidden">
            <div className="fixed top-0 left-0 w-full h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] translate-y-1/3 pointer-events-none z-0"></div>

            <div className="max-w-[1400px] mx-auto relative z-10">
                <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 glass-nav border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="inline-flex items-center gap-2 group">
                            <h1 className="text-2xl font-black tracking-tighter text-white group-hover:scale-[1.02] transition-transform">
                                SALVUS<span className="text-accent">.</span>
                            </h1>
                        </Link>
                        <div className="flex items-center gap-3">
                            <WalletConnect apiEndpoint="/api/vendor/link-wallet" />
                            <Link href="/" className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
                                <LogOut className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </nav>

                <div className="pt-24"></div>

                <div className="mb-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white tracking-tight"
                    >
                        Vendor Dashboard
                    </motion.h1>
                    <p className="text-gray-400 mt-2">Manage your store, transactions, and orders in one place</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <EnhancedStatCard
                        icon={Package}
                        label="Items Listed"
                        value={String(stats.itemsListed)}
                        color="text-blue-400"
                        bgColor="bg-blue-400/10"
                        borderColor="border-blue-400/20"
                        delay={0.1}
                    />
                    <EnhancedStatCard
                        icon={CheckCircle2}
                        label="Total Orders"
                        value={String(stats.totalOrders)}
                        color="text-emerald-400"
                        bgColor="bg-emerald-400/10"
                        borderColor="border-emerald-400/20"
                        delay={0.2}
                    />
                    <EnhancedStatCard
                        icon={DollarSign}
                        label="Payments Received"
                        value={`${(stats.paymentsReceived || 0).toLocaleString()} USDC`}
                        color="text-purple-400"
                        bgColor="bg-purple-400/10"
                        borderColor="border-purple-400/20"
                        delay={0.3}
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        <InventoryManagement allowedCategories={vendor?.allowedCategories || []} />
                        <TransactionHistory transactions={transactions} />
                    </motion.div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            {loading ? (
                                <div className="glass-card rounded-2xl p-6 h-[400px] animate-pulse">
                                    <div className="h-14 w-14 bg-white/10 rounded-xl mb-6"></div>
                                    <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
                                    <div className="space-y-3">
                                        <div className="h-20 bg-white/5 rounded-xl"></div>
                                        <div className="h-20 bg-white/5 rounded-xl"></div>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="glass-card rounded-2xl p-6 h-full border-red-500/20 bg-red-500/5">
                                    <div className="flex items-center gap-2 text-red-400 mb-2">
                                        <LogOut className="w-5 h-5 rotate-180" />
                                        <h3 className="font-bold">Unable to load profile</h3>
                                    </div>
                                    <p className="text-sm text-red-200/70 mb-4">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : vendor ? (
                                <VendorProfile vendor={vendor} />
                            ) : (
                                <div className="glass-card rounded-2xl p-6 h-full text-center flex flex-col items-center justify-center text-gray-400">
                                    <p>No vendor profile data found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
