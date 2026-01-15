'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { MapPin, ArrowRight } from 'lucide-react'

export default function ActiveCampaigns() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })

  const campaigns = [
    {
      name: 'Kerala Flood Relief',
      location: 'Kerala, India',
      desc: 'Providing emergency food and medical supplies to flood-affected families.',
      filled: 60,
      target: '5L USDC',
      raised: '3L USDC'
    },
    {
      name: 'Cyclone Michaung Aid',
      location: 'Chennai, India',
      desc: 'Shelter support and rehabilitation for coastal communities.',
      filled: 85,
      target: '12L USDC',
      raised: '10.2L USDC'
    }
  ]

  return (
    <section id="campaigns" ref={ref} className="py-24 bg-dark-darker relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-1/4 -right-64 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            className="text-left"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Active <span className="text-gradient-accent">Campaigns</span></h2>
            <p className="text-gray-400 max-w-lg">Direct impact opportunities open for contribution right now.</p>
          </motion.div>
          <motion.a
            href="/campaigns"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            className="hidden md:flex items-center gap-2 text-accent font-semibold hover:text-white transition-colors"
          >
            View All Campaigns <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {campaigns.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2 }}
              className="glass-card p-8 rounded-3xl hover:border-accent/30 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4" /> {c.location}
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-accent transition-colors">{c.name}</h3>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:text-dark-darker transition-all">
                  <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </div>

              <p className="text-gray-400 mb-8">{c.desc}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-white">Raised: {c.raised}</span>
                  <span className="text-gray-500">Goal: {c.target}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${c.filled}%` } : {}}
                    transition={{ duration: 1.5, delay: 0.5 + (i * 0.2) }}
                    className="h-full bg-gradient-to-r from-accent to-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-10 md:hidden">
          <a href="/campaigns" className="flex items-center gap-2 text-accent font-semibold hover:text-white transition-colors">
            View All Campaigns <ArrowRight className="w-5 h-5" />
          </a>
        </div>

      </div>
    </section>
  )
}

