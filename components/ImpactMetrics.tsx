'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, Activity, Users } from 'lucide-react'

type LandingStats = {
  totalFundsCollected: number
  totalSpent: number
  activeCampaigns: number
  peopleHelped: number
}

function Counter({
  value,
  suffix = '',
  prefix = '',
  duration = 1.5,
  isInView
}: {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  isInView: boolean
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      const ease = 1 - Math.pow(1 - progress, 5)
      setDisplayValue(Math.floor(ease * value))
      if (progress < 1) requestAnimationFrame(animate)
      else setDisplayValue(value)
    }
    requestAnimationFrame(animate)
  }, [isInView, value, duration])

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>
}

export default function ImpactMetrics() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-20%' })

  const [stats, setStats] = useState<LandingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/stats/landing')
        if (!res.ok) {
          throw new Error('Failed to load landing stats')
        }
        const data = await res.json()
        if (!mounted) return
        setStats({
          totalFundsCollected: data.totalFundsCollected ?? 0,
          totalSpent: data.totalSpent ?? 0,
          activeCampaigns: data.activeCampaigns ?? 0,
          peopleHelped: data.peopleHelped ?? 0
        })
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

  const metrics = [
    { icon: DollarSign, key: 'totalFundsCollected' as const, suffix: ' USDC', label: 'Funds Collected' },
    { icon: ShoppingCart, key: 'totalSpent' as const, suffix: ' USDC', label: 'Essentials Bought' },
    { icon: Activity, key: 'activeCampaigns' as const, suffix: '', label: 'Active Campaigns' },
    { icon: Users, key: 'peopleHelped' as const, suffix: '', label: 'People Helped' }
  ]

  return (
    <section ref={ref} className="py-24 relative overflow-hidden bg-dark-darker">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-bold tracking-widest uppercase mb-3 block">Real Impact</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white">Making a difference <span className="text-gradient-accent">every day.</span></h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {metrics.map((m, i) => {
            const Icon = m.icon
            const rawValue = stats ? stats[m.key] : 0
            const showDash = !loading && (error || !stats)
            return (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group text-center"
              >
                <div className="mx-auto w-16 h-16 mb-6 rounded-2xl glass-panel flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300 neon-glow">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight min-h-[2.5rem] flex items-center justify-center">
                  {loading ? (
                    <div className="h-7 w-20 bg-white/10 rounded-md animate-pulse" />
                  ) : showDash ? (
                    <span>—</span>
                  ) : (
                    <Counter value={rawValue} prefix="" suffix={m.suffix} isInView={isInView} />
                  )}
                </div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{m.label}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

