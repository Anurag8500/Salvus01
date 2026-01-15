'use client'

import { motion } from 'framer-motion'
import { XCircle, ChevronRight, ChevronLeft, CheckCircle, User, MapPin, Phone, Shield, AlertTriangle, Info, FileText, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'

interface OnboardBeneficiaryModalProps {
    isOpen: boolean
    onClose: () => void
    campaignLocation?: string // To auto-fill state
    campaignId?: string
    onSuccess?: () => void
}

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']
const AGE_RANGES = ['0-12', '13-18', '19-60', '60+']
const VULNERABILITY_CATS = ['Senior Citizen', 'Child', 'Disabled', 'Pregnant', 'Single Parent', 'None']
const ID_TYPES = ['Aadhaar (Last 4)', 'Ration Card', 'NGO ID', 'Local Authority Cert']

export default function OnboardBeneficiaryModal({ isOpen, onClose, campaignLocation = 'Kerala', campaignId, onSuccess }: OnboardBeneficiaryModalProps) {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [systemId, setSystemId] = useState<string>(() => `BEN-${Math.floor(1000 + Math.random() * 9000)}`)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        ageType: 'exact', // 'exact' or 'range'
        age: '',
        ageRange: '',

        district: '',
        locality: '',
        householdSize: '',
        vulnerabilities: [] as string[],

        phone: '',
        email: '',
        confirmEmail: '',
        altContact: '',

        idType: '',
        idNumber: '', // Last 4 digits or specific ID
        riskFlags: [] as string[],
        internalNotes: '',

        confirmed: false
    })

    useEffect(() => {
        if (isOpen) {
            setSystemId(`BEN-${Math.floor(1000 + Math.random() * 9000)}`)
        }
    }, [isOpen])

    // Prevent background scroll when modal is open
    if (!isOpen) return null

    const handleNext = () => setStep(s => Math.min(s + 1, 5))
    const handleBack = () => setStep(s => Math.max(s - 1, 1))

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const toggleVulnerability = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            vulnerabilities: prev.vulnerabilities.includes(cat)
                ? prev.vulnerabilities.filter(c => c !== cat)
                : [...prev.vulnerabilities, cat]
        }))
    }

    const toggleRiskFlag = (flag: string) => {
        setFormData(prev => ({
            ...prev,
            riskFlags: prev.riskFlags.includes(flag)
                ? prev.riskFlags.filter(f => f !== flag)
                : [...prev.riskFlags, flag]
        }))
    }

    const handleSubmit = async () => {
        if (!formData.confirmed) return
        if (!campaignId) {
            console.error("Campaign ID missing")
            return
        }
        // Confirm Email validation
        if (!formData.email || !formData.confirmEmail) {
            alert('Please enter and confirm the email address')
            setStep(3)
            return
        }
        if (formData.email.trim() !== formData.confirmEmail.trim()) {
            alert('Email and Confirm Email must match')
            setStep(3)
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/beneficiaries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                    gender: formData.gender,
                    ageType: formData.ageType,
                    age: formData.age ? Number(formData.age) : undefined,
                    ageRange: formData.ageRange,
                    district: formData.district,
                    locality: formData.locality,
                    phone: formData.phone,
                    email: formData.email,
                    idType: formData.idType,
                    idNumber: formData.idNumber,
                    status: 'Pending',
                    riskLevel: formData.riskFlags.length > 0 ? 'High' : 'Low',
                    vulnerabilities: formData.vulnerabilities,
                    riskFlags: formData.riskFlags,
                    internalNotes: formData.internalNotes,
                }),
            })

            if (res.ok) {
                if (onSuccess) onSuccess()
                onClose()
            } else {
                const errorData = await res.json()
                console.error('Failed to create beneficiary:', errorData)
                alert(errorData.message || 'Failed to create beneficiary')
            }
        } catch (error) {
            console.error('Error submitting beneficiary:', error)
            alert('An error occurred while onboarding the beneficiary.')
        } finally {
            setIsSubmitting(false)
        }
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
                        <h2 className="text-2xl font-black text-white tracking-tight">Onboard Beneficiary</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                            <span className={`px-2 py-0.5 rounded-full ${step >= 1 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>Identity</span>
                            <span className="text-gray-600">/</span>
                            <span className={`px-2 py-0.5 rounded-full ${step >= 2 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>Loc</span>
                            <span className="text-gray-600">/</span>
                            <span className={`px-2 py-0.5 rounded-full ${step >= 3 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>Contact</span>
                            <span className="text-gray-600">/</span>
                            <span className={`px-2 py-0.5 rounded-full ${step >= 4 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>Verify</span>
                            <span className="text-gray-600">/</span>
                            <span className={`px-2 py-0.5 rounded-full ${step >= 5 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>Rev</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <XCircle className="w-8 h-8" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    {/* STEP 1: IDENTITY */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Beneficiary Identity</h3>
                                    <p className="text-gray-400 text-sm">Core details for identification and audit.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Generated ID</label>
                                    <div className="text-lg font-mono text-gray-300">{systemId}</div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                        placeholder="Name as per ID"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-300 mb-2 block">Gender <span className="text-red-500">*</span></label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-accent/50"
                                        >
                                            <option value="" disabled>Select</option>
                                            {GENDERS.map(g => <option key={g} value={g} className="bg-dark-darker">{g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-300 mb-2 block">Age <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <select
                                                className="w-20 bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-white text-xs focus:outline-none focus:border-accent/50"
                                                value={formData.ageType}
                                                onChange={(e) => handleInputChange('ageType', e.target.value)}
                                            >
                                                <option value="exact" className="bg-dark-darker">Exact</option>
                                                <option value="range" className="bg-dark-darker">Range</option>
                                            </select>
                                            {formData.ageType === 'exact' ? (
                                                <input
                                                    type="number"
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-accent/50"
                                                    placeholder="Yrs"
                                                    value={formData.age}
                                                    onChange={(e) => handleInputChange('age', e.target.value)}
                                                />
                                            ) : (
                                                <select
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-accent/50"
                                                    value={formData.ageRange}
                                                    onChange={(e) => handleInputChange('ageRange', e.target.value)}
                                                >
                                                    <option value="" disabled>Select</option>
                                                    {AGE_RANGES.map(r => <option key={r} value={r} className="bg-dark-darker">{r}</option>)}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: LOCATION & ELIGIBILITY */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Location & Eligibility</h3>
                                    <p className="text-gray-400 text-sm">Ensure beneficiary belongs to target region.</p>
                                </div>
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
                                <label className="text-sm font-bold text-gray-300 mb-2 block">Locality / Village <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.locality}
                                    onChange={(e) => handleInputChange('locality', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-300 mb-2 block">Vulnerability Category (Optional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {VULNERABILITY_CATS.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleVulnerability(cat)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${formData.vulnerabilities.includes(cat)
                                                    ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: CONTACT */}
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Contact & Access</h3>
                                    <p className="text-gray-400 text-sm">Communication and account verification.</p>
                                </div>
                            </div>

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
                                <p className="text-xs text-gray-500 mt-2">Required for OTP verification and notifications.</p>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-300 mb-2 block">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                    placeholder="beneficiary@example.com"
                                />
                                <p className="text-xs text-gray-500 mt-1">Required for account access.</p>
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
                                <p className="text-xs text-gray-500 mt-1">Enter the same email again to confirm.</p>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: AID RULES & VERIFICATION */}
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Verification Status</h4>

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Identity Proof Type (Optional)</label>
                                    <select
                                        value={formData.idType}
                                        onChange={(e) => handleInputChange('idType', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 mb-3"
                                    >
                                        <option value="" disabled>Select ID Type</option>
                                        {ID_TYPES.map(t => <option key={t} value={t} className="bg-dark-darker">{t}</option>)}
                                    </select>
                                    {formData.idType && (
                                        <input
                                            type="text"
                                            placeholder="Last 4 digits only / ID Number"
                                            value={formData.idNumber}
                                            onChange={(e) => handleInputChange('idNumber', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Risk Flags</label>
                                    <div className="flex gap-2">
                                        {['Suspected Duplicate', 'Needs Field Verification', 'Urgent'].map(flag => (
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
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Internal Notes</label>
                                    <textarea
                                        value={formData.internalNotes}
                                        onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                        placeholder="Enter any internal notes for this beneficiary"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: REVIEW */}
                    {step === 5 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 border border-accent/20">
                                    <User className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="text-2xl font-black text-white">Review Registration</h3>
                                <p className="text-gray-400">Confirm eligibility before onboarding.</p>
                            </div>

                            <div className="glass-card rounded-2xl p-6 border border-white/10">
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div>
                                        <div className="text-gray-500 text-xs uppercase">Name</div>
                                        <div className="text-white font-bold">{formData.firstName}</div>
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
                                        <div className="text-gray-500 text-xs uppercase">Vulnerabilities</div>
                                        <div className="text-white">{formData.vulnerabilities.join(', ') || 'None'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, confirmed: !prev.confirmed }))}>
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.confirmed ? 'bg-accent border-accent' : 'border-gray-500'}`}>
                                    {formData.confirmed && <CheckCircle className="w-3.5 h-3.5 text-dark-darker" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-200 select-none">I confirm this beneficiary matches campaign criteria.</p>
                                    <p className="text-xs text-gray-500 mt-1">False entries can be traced back to admin login.</p>
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
                            disabled={!formData.confirmed}
                            onClick={handleSubmit}
                            className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl transition-all shadow-lg ${formData.confirmed && !isSubmitting
                                    ? 'bg-accent text-dark-darker hover:bg-accent-dark shadow-accent/20 cursor-pointer'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                                }`}
                        >
                            <CheckCircle className="w-5 h-5" />
                            {isSubmitting ? 'Onboarding...' : 'Onboard Beneficiary'}
                        </button>
                    )}
                </div>

            </motion.div>
        </div>
    )
}
