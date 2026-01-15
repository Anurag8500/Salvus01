'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, Activity, Users } from 'lucide-react'

// Counter Component - Clean & minimal
function Counter({ value, suffix = '', prefix = '', duration = 1.5, isInView }: { value: number, suffix?: string, prefix?: string, duration?: number, isInView: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      const ease = 1 - Math.pow(1 - progress, 5) // Ease out quint
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

  const metrics = [
    { icon: DollarSign, value: 8500, prefix: '', suffix: ' USDC', label: 'Funds Collected' },
    { icon: ShoppingCart, value: 6500, prefix: '', suffix: ' USDC', label: 'Essentials Bought' },
    { icon: Activity, value: 12, prefix: '', suffix: '+', label: 'Active Campaigns' },
    { icon: Users, value: 2450, prefix: '', suffix: '+', label: 'People Helped' },
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
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group text-center"
            >
              <div className="mx-auto w-16 h-16 mb-6 rounded-2xl glass-panel flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300 neon-glow">
                <m.icon className="w-8 h-8" />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">
                <Counter value={m.value} prefix={m.prefix} suffix={m.suffix} isInView={isInView} />
              </div>
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

