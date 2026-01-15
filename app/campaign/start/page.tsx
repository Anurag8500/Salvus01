'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Building2, Mail, User, FileText, CheckCircle, ArrowRight, Globe, ShieldAlert, Sparkles, ChevronDown, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function StartCampaignPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    contactPerson: '',
    officialEmail: '',
    website: '',
    phone: '',
    regNumber: '',
    headOfficeLocation: '',
    reason: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)

  const [documents, setDocuments] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const fd = new FormData()
      fd.append('organizationName', formData.organizationName)
      fd.append('organizationType', formData.organizationType)
      fd.append('contactPerson', formData.contactPerson)
      fd.append('officialEmail', formData.officialEmail)
      fd.append('website', formData.website)
      fd.append('phone', formData.phone)
      fd.append('regNumber', formData.regNumber)
      fd.append('headOfficeLocation', formData.headOfficeLocation)
      fd.append('reason', formData.reason)
      documents.forEach(f => fd.append('documents', f))
      const res = await fetch('/api/campaign-requests', {
        method: 'POST',
        body: fd
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Submission failed')
      }
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setDocuments(prev => [...prev, ...newFiles])
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-gray-200 relative overflow-hidden p-6 py-12">
      {/* Immersive Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        {/* Moving Orbs */}
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.5, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]"
        />
      </div>

      <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-10">

        {/* Left Side: The Pitch */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:block space-y-8 sticky top-24"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4"
            >
              <Sparkles className="w-4 h-4" />
              Become a Savior
            </motion.div>
            <h1 className="text-7xl font-black text-white tracking-tighter leading-tight mb-8">
              Launch Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-200">Relief Mission.</span>
            </h1>
            <p className="text-2xl text-gray-400 max-w-lg leading-relaxed">
              Join the autonomous network. Create transparent, efficient relief campaigns powered by smart contracts and real-time auditing.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { title: "Instant Deployment", desc: "Set up funds and beneficiaries in minutes.", icon: Sparkles },
              { title: "Transparency First", desc: "Every transaction is tracked and auditable.", icon: ShieldAlert },
              { title: "Global Reach", desc: "Connect with donors worldwide instantly.", icon: Globe },
            ].map((item, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                key={i}
                className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-base text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: The Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Glow Effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-accent to-purple-600 rounded-3xl blur opacity-20 animate-pulse-slow"></div>

          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
            {!submitted ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Organization Details</h2>
                  <p className="text-gray-400 text-sm">Tell us about the entity managing this campaign.</p>
                </div>
                {error && <div className="text-sm text-red-400">{error}</div>}

                  <motion.form
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <motion.div variants={itemVariants}>
                      <div className={`relative group transition-all duration-300 ${activeField === 'orgName' ? 'scale-[1.02]' : ''}`}>
                        <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeField === 'orgName' ? 'text-accent' : 'text-gray-500'}`} />
                        <input
                          type="text"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleChange}
                          onFocus={() => setActiveField('orgName')}
                          onBlur={() => setActiveField(null)}
                          required
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 focus:bg-white/10 transition-all font-medium"
                          placeholder="Organization Name *"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                          <Globe className={`w-5 h-5 transition-colors ${activeField === 'orgType' ? 'text-accent' : 'text-gray-500'}`} />
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveField(activeField === 'orgType' ? null : 'orgType')}
                          className={`w-full pl-12 pr-4 py-4 text-left bg-white/5 border rounded-xl text-white focus:outline-none transition-all font-medium flex items-center justify-between ${activeField === 'orgType' ? 'border-accent/60 bg-white/10' : 'border-white/10'}`}
                        >
                          <span className={formData.organizationType ? 'text-white' : 'text-gray-500'}>
                            {formData.organizationType || 'Type *'}
                          </span>
                          <motion.div
                            animate={{ rotate: activeField === 'orgType' ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {activeField === 'orgType' && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-1"
                            >
                              {['NGO', 'Government', 'Private', 'Relief Body'].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, organizationType: type })
                                    setActiveField(null)
                                  }}
                                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent/10 hover:text-accent text-gray-300 transition-colors flex items-center justify-between group/item"
                                >
                                  <span>{type}</span>
                                  {formData.organizationType === type && (
                                    <motion.div layoutId="check">
                                      <CheckCircle className="w-4 h-4 text-accent" />
                                    </motion.div>
                                  )}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className={`relative group`}>
                        <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500`} />
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 focus:bg-white/10 transition-all font-medium"
                          placeholder="Contact Person *"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className={`relative group transition-all duration-300 ${activeField === 'headOffice' ? 'scale-[1.02]' : ''}`}>
                        <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeField === 'headOffice' ? 'text-accent' : 'text-gray-500'}`} />
                        <input
                          type="text"
                          name="headOfficeLocation"
                          value={formData.headOfficeLocation}
                          onChange={handleChange}
                          onFocus={() => setActiveField('headOffice')}
                          onBlur={() => setActiveField(null)}
                          required
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 focus:bg-white/10 transition-all font-medium"
                          placeholder="Head Office Location *"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className={`relative group transition-all duration-300 ${activeField === 'email' ? 'scale-[1.02]' : ''}`}>
                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeField === 'email' ? 'text-accent' : 'text-gray-500'}`} />
                        <input
                          type="email"
                        name="officialEmail"
                        value={formData.officialEmail}
                        onChange={handleChange}
                        onFocus={() => setActiveField('email')}
                        onBlur={() => setActiveField(null)}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 focus:bg-white/10 transition-all font-medium"
                        placeholder="Official Email *"
                      />
                    </div>
                  </motion.div>

                  {/* Phone & Website */}
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`relative group transition-all duration-300 ${activeField === 'phone' ? 'scale-[1.02]' : ''}`}>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        {/* Phone Icon SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors ${activeField === 'phone' ? 'text-accent' : 'text-gray-500'}`}>
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => setActiveField('phone')}
                        onBlur={() => setActiveField(null)}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 focus:bg-white/10 transition-all font-medium"
                        placeholder="Phone No *"
                      />
                    </div>

                    <div className={`relative group transition-all duration-300 ${activeField === 'website' ? 'scale-[1.02]' : ''}`}>
                      <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeField === 'website' ? 'text-accent' : 'text-gray-500'}`} />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        onFocus={() => setActiveField('website')}
                        onBlur={() => setActiveField(null)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 focus:bg-white/10 transition-all font-medium"
                        placeholder="Website (Optional)"
                      />
                    </div>
                  </motion.div>

                  {/* Reg No */}
                  <motion.div variants={itemVariants}>
                    <div className={`relative group transition-all duration-300 ${activeField === 'regNo' ? 'scale-[1.02]' : ''}`}>
                      <FileText className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${activeField === 'regNo' ? 'text-accent' : 'text-gray-500'}`} />
                      <input
                        type="text"
                        name="regNumber"
                        value={formData.regNumber}
                        onChange={handleChange}
                        onFocus={() => setActiveField('regNo')}
                        onBlur={() => setActiveField(null)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 focus:bg-white/10 transition-all font-medium"
                        placeholder="Registration Number (Optional)"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className={`relative group transition-all duration-300 ${activeField === 'reason' ? 'scale-[1.02]' : ''}`}>
                      <FileText className={`absolute left-4 top-5 w-5 h-5 transition-colors ${activeField === 'reason' ? 'text-accent' : 'text-gray-500'}`} />
                      <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        onFocus={() => setActiveField('reason')}
                        onBlur={() => setActiveField(null)}
                        required
                        rows={3}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/60 focus:bg-white/10 transition-all resize-none font-medium"
                        placeholder="Mission Objective / Reason for Campaign *"
                      />
                    </div>
                  </motion.div>

                  {/* File Upload */}
                  <motion.div variants={itemVariants}>
                    <label className="block w-full cursor-pointer group">
                      <div className="w-full border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors hover:border-accent/40">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          {/* Upload Icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-300">Upload Documents</p>
                        <p className="text-xs text-gray-500 mt-1">Registration Certs, Tax Docs (PDF, JPG)</p>
                      </div>
                      <input type="file" multiple className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                    {documents.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {documents.map((doc, i) => (
                          <div key={i} className="flex items-center text-xs text-accent bg-accent/10 py-1 px-3 rounded-lg border border-accent/20 w-fit">
                            <CheckCircle className="w-3 h-3 mr-2" />
                            {doc.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 bg-accent hover:bg-accent-dark text-dark-darker font-bold text-lg rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Initialize Campaign</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    * Required Fields. All submissions are verified by Salvus HQ.
                  </p>

                </motion.form>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-24 h-24 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-3xl font-black text-white mb-2">Request Transmitted</h2>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                  Your campaign initiation request has been securely logged. The council will review your credentials shortly.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10"
                >
                  Return to Base
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
