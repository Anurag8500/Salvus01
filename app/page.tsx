'use client'

import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ImpactMetrics from '@/components/ImpactMetrics'
import HowItWorks from '@/components/HowItWorks'
import ActiveCampaigns from '@/components/ActiveCampaigns'
import WhySalvus from '@/components/WhySalvus'
import Footer from '@/components/Footer'

export default function Home() {
  useEffect(() => {
    // Disable default browser scroll restoration
    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual'
    }
    // Force scroll to top on mount
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ImpactMetrics />
      <HowItWorks />
      <ActiveCampaigns />
      <WhySalvus />
      <Footer />
    </main>
  )
}


