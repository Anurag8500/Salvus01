'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'glass-nav py-4' : 'bg-transparent py-6'
          }`}
      >
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-50 group">
            <span className="text-2xl font-bold tracking-tighter text-white">
              SALVUS<span className="text-accent">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#campaigns"
              onClick={(e) => handleScrollTo(e, 'campaigns')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Campaigns
            </a>
            <Link href="/transparency" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Transparency
            </Link>
            <Link href="/campaign/start" className="text-sm font-medium text-white hover:text-accent transition-colors">
              Start a Relief Campaign
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="group relative px-5 py-2 overflow-hidden rounded-full bg-accent hover:bg-accent-dark transition-colors"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2 text-sm font-bold text-dark-darker">
                Get Started <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative z-50 p-2 text-gray-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-dark-darker/95 backdrop-blur-xl pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              <a
                href="#campaigns"
                onClick={(e) => {
                  handleScrollTo(e, 'campaigns')
                  setIsMobileMenuOpen(false)
                }}
                className="text-2xl font-medium text-gray-300 hover:text-white cursor-pointer"
              >
                Campaigns
              </a>
              <Link
                href="/transparency"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-medium text-gray-300 hover:text-white"
              >
                Transparency
              </Link>
              <Link
                href="/campaign/start"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-medium text-accent hover:text-white"
              >
                Start a Relief Campaign
              </Link>
              <hr className="border-white/10" />
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-medium text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 bg-accent text-dark-darker text-center font-bold text-xl rounded-xl"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
