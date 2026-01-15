'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link, Lock, Zap, ShieldCheck } from 'lucide-react'

export default function WhySalvus() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section ref={ref} className="py-24 relative overflow-hidden bg-black">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Why <span className="text-gradient-accent">Salvus?</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Replacing broken trust with immutable code.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 - Large */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="md:col-span-2 p-8 rounded-3xl glass-card relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 bg-accent/20 blur-3xl rounded-full group-hover:bg-accent/30 transition-all duration-500"></div>
            <ShieldCheck className="w-12 h-12 text-accent mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Unbreakable Security</h3>
            <p className="text-gray-400">Funds are locked in smart contracts and only released when verified stores scan a beneficiary's QR code. No middleman can touch the money.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl glass-panel md:col-span-1 border border-white/5"
          >
            <Link className="w-10 h-10 text-purple-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Direct Connection</h3>
            <p className="text-gray-400 text-sm">Donors see exactly where their money goes, down to the item purchased.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-3xl glass-panel md:col-span-1 border border-white/5"
          >
            <Lock className="w-10 h-10 text-pink-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Anti-Fraud</h3>
            <p className="text-gray-400 text-sm">Identity is verified via government ID before any aid is dispensed.</p>
          </motion.div>

          {/* Card 4 - Large */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 p-8 rounded-3xl glass-card relative overflow-hidden group"
          >
            <div className="absolute bottom-0 left-0 p-12 bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/30 transition-all duration-500"></div>
            <Zap className="w-12 h-12 text-blue-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Instant Settlement</h3>
            <p className="text-gray-400">Partner stores receive payments instantly in local currency upon transaction verification.</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

