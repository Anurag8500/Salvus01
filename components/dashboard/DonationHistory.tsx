'use client'

import { motion } from 'framer-motion'
import { Eye, CheckCircle, Clock, ExternalLink, History, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react';

export default function DonationHistory() {
  const [donations, setDonations] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    fetch('/api/donations')
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        setDonations(data.donationHistory || []);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-[#0A0A0A] rounded-3xl p-8 border border-white/5 relative overflow-hidden group/container"
    >
      {/* Subtle Gradient Glow in Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] group-hover/container:bg-accent/10 transition-colors duration-1000 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-accent shadow-inner shadow-white/5">
              <History className="w-6 h-6" />
            </div>
            Recent Activity
          </h2>
          <p className="text-gray-400 text-sm mt-2 ml-1">
            Your entire impact history, verified on-chain.
          </p>
        </div>

        {/* Summary Stats Mini-Bar */}
        <div className="flex items-center gap-4 hidden md:flex">
          <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-white text-sm font-medium">{donations.length} Contributions</span>
          </div>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-gray-600 ring-1 ring-white/10">
            <TrendingUp className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-gray-300 font-semibold text-lg">No contributions yet</p>
          <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
            Your journey of impact begins with a single donation. Support a verified campaign to see your history here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative z-10 w-full">
          {/* Header Row for Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Campaign</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {donations.map((donation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative rounded-2xl p-[1px] bg-gradient-to-r from-white/5 to-white/0 hover:from-accent/30 hover:to-white/10 transition-all duration-300"
            >
              <div className="relative flex flex-col md:grid md:grid-cols-12 items-center p-5 bg-[#0F0F0F] rounded-[15px] gap-4 h-full md:gap-4 group-hover:bg-[#111] transition-colors">

                {/* Mobile Header (Hidden on Desktop) */}
                <div className="flex md:hidden w-full items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{donation.date ? new Date(donation.date).toLocaleDateString() : 'Date Unknown'}</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${donation.txHash ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                    {donation.txHash ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {donation.txHash ? 'Verified' : 'Pending'}
                  </div>
                </div>

                {/* Campaign Info (Col Span 4) */}
                <div className="w-full md:col-span-4 flex items-center gap-4">
                  <div className="hidden md:flex w-10 h-10 rounded-full bg-white/5 border border-white/5 items-center justify-center text-gray-400 group-hover:text-white group-hover:border-white/20 transition-all">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-white font-bold text-base truncate group-hover:text-accent transition-colors">
                      {donation.campaign}
                    </h3>
                    <a
                      href={donation.txHash ? `https://scan.testnet.monad.xyz/tx/${donation.txHash}` : '#'}
                      target="_blank"
                      className="text-xs text-gray-500 hover:text-accent underline decoration-accent/30 hover:decoration-accent transition-all truncate font-mono mt-0.5 flex items-center gap-1"
                    >
                      {donation.txHash ? `${donation.txHash.slice(0, 10)}...` : 'Processing Transaction...'}
                      {donation.txHash && <ExternalLink className="w-3 h-3" />}
                    </a>
                  </div>
                </div>

                {/* Status (Col Span 3) - Desktop Only */}
                <div className="hidden md:flex col-span-3 items-center">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${donation.txHash ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/5 border-amber-500/20 text-amber-400'}`}>
                    {donation.txHash ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {donation.txHash ? 'Contract Verified' : 'Confirming...'}
                  </div>
                </div>

                {/* Date (Col Span 3) - Desktop Only */}
                <div className="hidden md:flex col-span-3 flex-col justify-center">
                  <span className="text-gray-300 text-sm font-medium">
                    {donation.date ? new Date(donation.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '—'}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {donation.date ? new Date(donation.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                {/* Amount (Col Span 2) */}
                <div className="w-full md:col-span-2 flex items-center justify-between md:justify-end gap-2 md:text-right border-t md:border-t-0 border-white/5 pt-3 md:pt-0 mt-2 md:mt-0">
                  <span className="md:hidden text-sm text-gray-500 font-medium">Donation Amount</span>
                  <div>
                    <div className="text-xl font-bold text-white tracking-tight group-hover:text-accent transition-colors">
                      {donation.amount?.toLocaleString()} <span className="text-xs font-normal text-gray-500 ml-0.5">USDC</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
