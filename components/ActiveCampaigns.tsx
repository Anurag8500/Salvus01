'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { MapPin, ArrowRight } from 'lucide-react'

type ActiveCampaign = {
  id: string
  name: string
  location: string
  description: string
  fundsRaised: number
  fundingGoal: number
  escrowAddress: string
}

export default function ActiveCampaigns() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })

  const [campaigns, setCampaigns] = useState<ActiveCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/campaigns/active')
        if (!res.ok) {
          throw new Error('Failed to load campaigns')
        }
        const data = await res.json()
        if (!mounted) return
        const items: ActiveCampaign[] = Array.isArray(data.campaigns)
          ? data.campaigns.map((c: any) => ({
              id: String(c.id || c._id || ''),
              name: c.name || '',
              location: c.location || '',
              description: c.description || '',
              fundsRaised: typeof c.fundsRaised === 'number' ? c.fundsRaised : 0,
              fundingGoal: typeof c.fundingGoal === 'number' ? c.fundingGoal : 0,
              escrowAddress: c.escrowAddress || ''
            }))
          : []
        setCampaigns(items)
      } catch {
        if (!mounted) return
        setError(true)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const loadingSkeletons = [0, 1]

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
          {loading &&
            loadingSkeletons.map((i) => (
              <div
                key={i}
                className="glass-card p-8 rounded-3xl border border-white/5 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-white/10 rounded" />
                    <div className="h-6 w-48 bg-white/10 rounded" />
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10" />
                </div>
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-2 w-full bg-white/10 rounded" />
              </div>
            ))}

          {!loading && !error && campaigns.length === 0 && (
            <div className="col-span-1 lg:col-span-2 glass-card p-8 rounded-3xl border border-white/5 text-center text-gray-400">
              No active campaigns right now.
            </div>
          )}

          {!loading &&
            !error &&
            campaigns.map((c, i) => {
              const goal = c.fundingGoal || 0
              const raised = c.fundsRaised || 0
              const progress = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0

              return (
                <motion.div
                  key={c.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.2 }}
                  className="glass-card p-8 rounded-3xl hover:border-accent/30 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
                        <MapPin className="w-4 h-4" /> {c.location || '—'}
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-accent transition-colors">
                        {c.name || '—'}
                      </h3>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:text-dark-darker transition-all">
                      <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </div>
                  </div>

                  <p className="text-gray-400 mb-8">{c.description || '—'}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-white">
                        Raised:{' '}
                        {Number.isFinite(raised)
                          ? `${raised.toLocaleString()} USDC`
                          : '—'}
                      </span>
                      <span className="text-gray-500">
                        Goal:{' '}
                        {goal > 0
                          ? `${goal.toLocaleString()} USDC`
                          : '—'}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${progress}%` } : {}}
                        transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                        className="h-full bg-gradient-to-r from-accent to-blue-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}

          {!loading && error && (
            <div className="col-span-1 lg:col-span-2 glass-card p-8 rounded-3xl border border-red-500/20 text-center text-red-400">
              Unable to load active campaigns.
            </div>
          )}
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

