'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Heart, Lock, UserCheck, Store, FileCheck, ArrowRight } from 'lucide-react'

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })

  const steps = [
    { icon: Heart, title: 'Donate', desc: 'Donors contribute funds to a specific campaign.' },
    { icon: Lock, title: 'Secure', desc: 'Funds are locked in a smart contract system.' },
    { icon: UserCheck, title: 'Verify', desc: 'Beneficiaries are verified for eligibility.' },
    { icon: Store, title: 'Purchase', desc: 'Aid is spent only at verified partners.' },
    { icon: FileCheck, title: 'Audit', desc: 'Every transaction is recorded and public.' },
  ]

  return (
    <section id="how-it-works" ref={ref} className="py-32 bg-[#0b0c10] relative">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">The <span className="text-gradient-accent">Trust Chain</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">A transparent, unbreakable flow ensuring 100% of aid reaches the intended destination.</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative">

          {/* Connector Line */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-white/5 via-accent/50 to-white/5 z-0"></div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative z-10 flex flex-col items-center text-center group w-full lg:w-1/5"
            >
              <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10 group-hover:border-accent/50 group-hover:shadow-[0_0_30px_rgba(0,255,231,0.15)] bg-[#0b0c10]">
                <step.icon className="w-10 h-10 text-gray-400 group-hover:text-accent transition-colors" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 max-w-[180px] leading-relaxed">{step.desc}</p>

              {i < steps.length - 1 && (
                <ArrowRight className="lg:hidden w-6 h-6 text-gray-600 mt-6 rotate-90" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

