'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Shield, ArrowRight, ChevronDown } from 'lucide-react'
import { useRef } from 'react'


export default function Hero() {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  return (
    <section ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Layer */}
      <motion.div
        style={{ y, opacity, scale }}
        className="absolute inset-0 w-full h-full z-0"
      >
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        {/* Safe / Cool Glows */}
        {/* Main center glow - stable 'safe' blue/teal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent/20 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen"></div>

        {/* Secondary cooler tones */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-blue-500/20 rounded-full blur-[80px] animate-blob mix-blend-screen"></div>
      </motion.div>

      {/* Content Layer */}
      <div className="container mx-auto px-6 relative z-10 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass-panel border border-accent/20 text-accent text-sm font-medium mx-auto backdrop-blur-md"
        >
          <Shield className="w-4 h-4 fill-accent/20" />
          <span className="tracking-wider uppercase text-xs">Blockchain Secured Relief</span>
        </motion.div>

        {/* Massive Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative mb-8"
        >
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white relative z-10">
            SALVUS
          </h1>
          {/* Glowing Aura behind text */}
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-accent/20 absolute inset-0 blur-2xl z-0 select-none">
            SALVUS
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-12 font-light"
        >
          Disaster relief that is <strong className="text-white font-semibold">traceable</strong>, <strong className="text-white font-semibold">instant</strong>, and <strong className="text-white font-semibold">corruption-proof</strong>.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          <Link href="/signup" className="group relative px-8 py-4 bg-white text-dark-darker font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2 group-hover:text-dark-darker transition-colors">
              Start Helping <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <a
            href="#how-it-works"
            onClick={(e) => handleScrollTo(e, 'how-it-works')}
            className="px-8 py-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            See how it works
          </a>
        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] opacity-50">Scroll</span>
        <ChevronDown className="w-5 h-5 animate-bounce opacity-50" />
      </motion.div>

    </section>
  )
}
