'use client'

import { motion } from 'framer-motion'
import { DollarSign, Heart, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react';

export default function DonorOverview() {
  const [stats, setStats] = useState([
    {
      icon: DollarSign,
      label: 'Total Donated',
      value: '—',
      trend: '+12% this month',
      bgClass: 'bg-gradient-to-br from-indigo-500/20 to-blue-600/5',
      borderClass: 'border-indigo-500/20',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      pattern: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15) 0%, transparent 40%)',
    },
    {
      icon: Heart,
      label: 'Campaigns Supported',
      value: '—',
      trend: 'Active Contributor',
      bgClass: 'bg-gradient-to-br from-pink-500/20 to-rose-600/5',
      borderClass: 'border-pink-500/20',
      iconBg: 'bg-pink-500/20 text-pink-400',
      pattern: 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.15) 0%, transparent 40%)',
    },
    {
      icon: TrendingUp,
      label: 'Funds Utilized',
      value: 'Processing',
      subtext: 'Held in Escrow',
      bgClass: 'bg-gradient-to-br from-emerald-500/20 to-teal-600/5',
      borderClass: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      pattern: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.15) 0%, transparent 40%)',
    },
    {
      icon: Calendar,
      label: 'Last Donation',
      value: '—',
      trend: 'Keep it up!',
      bgClass: 'bg-gradient-to-br from-amber-500/20 to-orange-600/5',
      borderClass: 'border-amber-500/20',
      iconBg: 'bg-amber-500/20 text-amber-400',
      pattern: 'radial-gradient(circle at top right, rgba(245, 158, 11, 0.15) 0%, transparent 40%)',
    },
  ]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/donations')
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        fetch('/api/donor-impact')
          .then(res2 => res2.json())
          .then(impactData => {
            setStats(prev => [
              {
                ...prev[0],
                value: data.totalDonated ? `${data.totalDonated.toLocaleString()} USDC` : '0 USDC',
              },
              {
                ...prev[1],
                value: data.campaignsSupported?.toString() || '0',
              },
              {
                ...prev[2],
                value: impactData.fundsUtilized > 0 ? `${impactData.fundsUtilized.toLocaleString()} USDC` : '0 USDC',
              },
              {
                ...prev[3],
                value: data.lastDonation ? new Date(data.lastDonation).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No donations yet',
              },
            ]);
          });
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative rounded-3xl p-6 overflow-hidden border backdrop-blur-md ${stat.borderClass} ${stat.bgClass} group`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 transition-opacity duration-500 opacity-50 group-hover:opacity-100" style={{ background: stat.pattern }}></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3.5 rounded-2xl ${stat.iconBg} backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-2 -mt-2">
                  <ArrowUpRight className="w-5 h-5 text-white/30" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-400 font-medium text-sm tracking-wide uppercase">{stat.label}</div>
                <div className="text-2xl xl:text-3xl font-bold text-white tracking-tight">
                  {stat.value}
                </div>
                {stat.trend && (
                  <div className="text-xs font-medium text-gray-400 group-hover:text-white/80 transition-colors pt-2 border-t border-white/5 mt-3 flex items-center gap-1">
                    {stat.trend}
                  </div>
                )}
                {stat.subtext && (
                  <div className="text-xs font-medium text-gray-400 group-hover:text-white/80 transition-colors pt-2 border-t border-white/5 mt-3">
                    {stat.subtext}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

