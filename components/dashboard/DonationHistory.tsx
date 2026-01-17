'use client'

import { motion } from 'framer-motion'
import { Eye, CheckCircle, Clock } from 'lucide-react'

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
      className="glass rounded-2xl p-8 border border-dark-lighter/50 mt-8 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10"></div>

      <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Donation History
          </h2>
          <p className="text-gray-400 text-sm">Track all your contributions</p>
        </div>

        {donations.length === 0 ? (
          <div className="text-center text-gray-400">You haven’t donated yet.</div>
        ) : (
          <div className="space-y-3">
            {donations.map((donation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="group relative p-5 rounded-xl border-2 border-dark-lighter/50 bg-gradient-to-br from-dark-lighter/20 to-dark-lighter/10 hover:border-accent/30 hover:bg-dark-lighter/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-accent transition-colors">
                      {donation.campaign}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-semibold text-lg">{donation.amount?.toLocaleString()} USDC</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Date:</span>
                        <span className="text-gray-300">{donation.date ? new Date(donation.date).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href={donation.txHash ? `#${donation.txHash}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent/50 text-accent rounded-lg transition-all duration-300 text-sm font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
