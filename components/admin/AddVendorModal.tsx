'use client'

import { motion } from 'framer-motion'
import { XCircle, ChevronRight, ChevronLeft, CheckCircle, Store, MapPin, Phone, Shield, AlertTriangle, FileText, ShoppingBag, Banknote, Wallet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface AddVendorModalProps {
    isOpen: boolean
    onClose: () => void
    campaignLocation?: string
    campaignCategories?: string[]
    campaignId?: string
    onSuccess?: () => void
}

const VENDOR_TYPES = ['Medical Store', 'Grocery / Ration Shop', 'Transport Provider', 'Shelter Provider', 'Educational Supplies Store']
const PROOF_TYPES = ['Shop License', 'GST Registration', 'Local Authority Letter', 'NGO Recommendation']

export default function AddVendorModal({
    isOpen,
    onClose,
    campaignLocation = 'Kerala',
    campaignCategories = [],
    campaignId,
    onSuccess
}: AddVendorModalProps) {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        district: '',
        area: '',
        operatingType: 'Fixed',

        phone: '',
        email: '',
        confirmEmail: '',
        contactPerson: '',

        selectedCategories: [] as string[],

        proofType: '',
        proofNumber: '',
        riskFlags: [] as string[],
        notes: '',
        walletAddress: '',

        confirmed: false
    })
    const [systemId, setSystemId] = useState<string>(() => `VEN-${Math.floor(1000 + Math.random() * 9000)}`)

    useEffect(() => {
        if (isOpen) {
            setSystemId(`VEN-${Math.floor(1000 + Math.random() * 9000)}`)
        }
    }, [isOpen])

    // Prevent background scroll when modal is open
    if (!isOpen) return null

    const handleNext = () => setStep(s => Math.min(s + 1, 5))
    const handleBack = () => setStep(s => Math.max(s - 1, 1))

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const toggleCategory = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(cat)
                ? prev.selectedCategories.filter(c => c !== cat)
                : [...prev.selectedCategories, cat]
        }))
    }

    const handleSubmit = async () => {
        if (!formData.confirmed) return
        if (!campaignId) {
            console.error("Campaign ID missing")
            return
        }

        if (!formData.name || !formData.type || !formData.district || !formData.area) {
            alert('Please fill in required fields: Name, Type, District, Area')
            setStep(1)
            return
        }
        if (!formData.contactPerson) {
            alert('Authorized Contact Person is required')
            setStep(1)
            return
        }
        if (!formData.email) {
            alert('Email Address is required')
            setStep(2)
            return
        }
        if (!formData.confirmEmail) {
            alert('Please confirm the email address')
            setStep(2)
            return
        }
        if (!formData.proofType || !formData.proofNumber || !formData.walletAddress) {
            alert('Please complete verification details: Proof and Wallet Address')
            setStep(4)
            return
        }
        if (!ethers.isAddress(formData.walletAddress)) {
            alert('Invalid Wallet Address')
            setStep(4)
            return
        }
        if (formData.email.trim() !== formData.confirmEmail.trim()) {
            alert('Email and Confirm Email must match')
            setStep(2)
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    name: formData.name,
                    type: formData.type,
                    district: formData.district,
                    area: formData.area,
                    phone: formData.phone,
                    email: formData.email,
                    contactPerson: formData.contactPerson,
                    category: formData.type,
                    authorizedCategories: formData.selectedCategories,
                    businessProofType: formData.proofType,
                    businessProofNumber: formData.proofNumber,
                    riskFlags: formData.riskFlags,
                    notes: formData.notes,
                    walletAddress: formData.walletAddress, // ✅ THIS LINE
                    status: 'Pending',
                    verified: false
                }),
            })

            if (res.ok) {
                if (onSuccess) onSuccess()
                onClose()
            } else {
                const errorData = await res.json()
                console.error('Failed to create vendor:', errorData)
                alert(`Failed to create vendor: ${errorData.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Error submitting vendor:', error)
            alert('An error occurred while onboarding the vendor.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleRiskFlag = (flag: string) => {
        setFormData(prev => ({
            ...prev,
            riskFlags: prev.riskFlags.includes(flag)
                ? prev.riskFlags.filter(f => f !== flag)
                : [...prev.riskFlags, flag]
        }))
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl glass-card rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Add Vendor / Store</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                            <span className={`px-2 py-0.5 rounded-full ${step >= 1 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>Identity</span>
                            <span className="text-gray-600">/</span>
                            <span className={`px-2 py-0.5 rounded-full ${step >= 2 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>Contact</span>
                            <span className="text-gray-600">/</span>
                            <span className={`px-2 py-0.5 rounded-full ${step >= 3 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>Rules</span>
                            <span className="text-gray-600">/</span>
                            <span className={`px-2 py-0.5 rounded-full ${step >= 4 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>Verify</span>
                            <span className="text-gray-600">/</span>
                            <span className={`px-2 py-0.5 rounded-full ${step >= 5 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>Review</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <XCircle className="w-8 h-8" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    {/* STEP 1: IDENTITY & LOCATION */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                    <Store className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Vendor Identity</h3>
                                    <p className="text-gray-400 text-sm">Basic details and operating location.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Generated ID</label>
                                    <div className="text-lg font-mono text-gray-300">{systemId}</div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Store / Business Name <span className="text-red-500">*</span></label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                        placeholder="e.g. Rahman Medical Store"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Authorized Contact Person <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.contactPerson}
                                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                        placeholder="Manager Name"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Vendor Type <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleInputChange('type', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                    >
                                        <option value="" disabled>Select Type</option>
                                        {VENDOR_TYPES.map(t => <option key={t} value={t} className="bg-dark-darker">{t}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-300 mb-2 block">State</label>
                                        <input type="text" value={campaignLocation} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-300 mb-2 block">District <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.district}
                                            onChange={(e) => handleInputChange('district', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Area / Locality <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.area}
                                        onChange={(e) => handleInputChange('area', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: CONTACT */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Contact Details</h3>
                                    <p className="text-gray-400 text-sm">For verification and payment notifications.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Phone Number <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">+91</span>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accent/50 font-mono"
                                            placeholder="XXXXXXXXXX"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                        placeholder="store@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Confirm Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        value={formData.confirmEmail}
                                        onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                        placeholder="re-enter email"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: SELLING RULES */}
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Selling Rules</h3>
                                    <p className="text-gray-400 text-sm">Restrict what this vendor can sell.</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-300 mb-3 block">Allowed Categories <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {campaignCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${formData.selectedCategories.includes(cat)
                                                    ? 'bg-accent/10 border-accent text-accent'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="font-bold text-sm">{cat}</span>
                                            {formData.selectedCategories.includes(cat) && <CheckCircle className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Caps removed */}
                        </motion.div>
                    )}

                    {/* STEP 4: VERIFICATION */}
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Verification & Compliance</h3>
                                    <p className="text-gray-400 text-sm">Ensure vendor legitimacy.</p>
                                </div>
                            </div>

                            <div className="space-y-4">

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Business Proof Type <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.proofType}
                                        onChange={(e) => handleInputChange('proofType', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 mb-3"
                                    >
                                        <option value="" disabled>Select Proof Type</option>
                                        {PROOF_TYPES.map(t => <option key={t} value={t} className="bg-dark-darker">{t}</option>)}
                                    </select>
                                    {formData.proofType && (
                                        <input
                                            type="text"
                                            value={formData.proofNumber}
                                            onChange={(e) => handleInputChange('proofNumber', e.target.value)}
                                            placeholder="License / Reg Number (Masked)"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block flex items-center gap-2">
                                        Wallet Address (for Payouts) <span className="text-red-500">*</span>
                                        {formData.walletAddress && !ethers.isAddress(formData.walletAddress) && (
                                            <span className="text-xs text-red-400 font-normal ml-auto">Invalid Address</span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={formData.walletAddress}
                                            onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                                            placeholder="0x..."
                                            className={`w-full bg-white/5 border rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none font-mono ${
                                                formData.walletAddress && !ethers.isAddress(formData.walletAddress) 
                                                ? 'border-red-500/50 focus:border-red-500' 
                                                : 'border-white/10 focus:border-accent/50'
                                            }`}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Must be a valid EVM address. This address will receive USDC payouts.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Risk Flags</label>
                                    <div className="flex gap-2">
                                        {['High Pricing Risk', 'Location Mismatch', 'New Vendor'].map(flag => (
                                            <button
                                                key={flag}
                                                onClick={() => toggleRiskFlag(flag)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${formData.riskFlags.includes(flag)
                                                        ? 'bg-red-500/20 border-red-500 text-red-300'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-red-500/30'
                                                    }`}
                                            >
                                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                                {flag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Internal Notes (Optional)</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 h-20"
                                        placeholder="Admin verification remarks..."
                                    ></textarea>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: REVIEW */}
                    {step === 5 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 border border-accent/20">
                                    <Store className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="text-2xl font-black text-white">Review Vendor</h3>
                                <p className="text-gray-400">Confirm details before authorization.</p>
                            </div>

                            <div className="glass-card rounded-2xl p-6 border border-white/10">
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div>
                                        <div className="text-gray-500 text-xs uppercase">Store Name</div>
                                        <div className="text-white font-bold">{formData.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs uppercase">Location</div>
                                        <div className="text-white font-bold">{campaignLocation}, {formData.district}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs uppercase">Phone</div>
                                        <div className="text-white font-mono">{formData.phone}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs uppercase">Allowed Categories</div>
                                        <div className="text-white">{formData.selectedCategories.join(', ') || 'None'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, confirmed: !prev.confirmed }))}>
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.confirmed ? 'bg-accent border-accent' : 'border-gray-500'}`}>
                                    {formData.confirmed && <CheckCircle className="w-3.5 h-3.5 text-dark-darker" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-200 select-none">I confirm this vendor is legitimate and eligible.</p>
                                    <p className="text-xs text-gray-500 mt-1">Authorized vendors can receive relief funds immediately.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-sm flex justify-between items-center">
                    {step > 1 ? (
                        <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                    ) : <div></div>}

                    {step < 5 ? (
                        <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                            Next Step <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            disabled={!formData.confirmed || isSubmitting}
                            onClick={handleSubmit}
                            className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl transition-all shadow-lg ${formData.confirmed && !isSubmitting
                                    ? 'bg-accent text-dark-darker hover:bg-accent-dark shadow-accent/20 cursor-pointer'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                                }`}
                        >
                            <Store className="w-5 h-5" />
                            {isSubmitting ? 'Onboarding...' : 'Onboard Vendor'}
                        </button>
                    )}
                </div>

            </motion.div>
        </div>
    )
}
