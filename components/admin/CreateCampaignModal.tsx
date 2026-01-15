'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { XCircle, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, Info, Calendar, DollarSign, MapPin, Building2, Shield, AlertOctagon } from 'lucide-react'
import { useState } from 'react'
type Category = 'Food' | 'Medicine' | 'Transport' | 'Shelter'
const CATEGORIES: Category[] = ['Food', 'Medicine', 'Transport', 'Shelter']
interface CreateCampaignModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}



const DISASTER_TYPES = ['Flood', 'Cyclone', 'Earthquake', 'Fire', 'Drought', 'Other']

export default function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        disasterType: '',
        locationState: '',
        locationDistrict: '',
        description: '',
        budgetCap: '',
        beneficiaryCap: '',
        startDate: '',
        endDate: '',
        categories: [] as Category[],
        categoryMaxs: {} as Record<string, string>,
        confirmed: false
    })

    // Prevent background scroll when modal is open
    if (!isOpen) return null

    const handleNext = () => setStep(s => Math.min(s + 1, 4))
    const handleBack = () => setStep(s => Math.max(s - 1, 1))

    const toggleCategory = (cat: Category) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }))
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!formData.confirmed) return
        if (!formData.name || !formData.disasterType || !formData.locationState || !formData.description) {
            alert('Please fill all mandatory identity fields')
            return
        }
        if (!formData.budgetCap || Number(formData.budgetCap) <= 0 || !formData.beneficiaryCap || Number(formData.beneficiaryCap) <= 0) {
            alert('Please set valid budget and per-beneficiary caps')
            return
        }
        if (Number(formData.beneficiaryCap) >= Number(formData.budgetCap)) {
            alert('Per-beneficiary cap must be less than total campaign budget.')
            return
        }
        if (!formData.startDate || !formData.endDate) {
            alert('Please set campaign start and end dates')
            return
        }
        if (new Date(formData.endDate).getTime() < new Date(formData.startDate).getTime()) {
            alert('End date must be after start date')
            return
        }
        if (!formData.categories.length) {
            alert('Please select at least one allowed category')
            return
        }
        const perCap = Number(formData.beneficiaryCap)
        const normalizedLimits: Record<string, number> = {}
        for (const cat of formData.categories) {
            const key = String(cat).toLowerCase().trim()
            const raw = formData.categoryMaxs[cat] ?? formData.categoryMaxs[key]
            const val = Number(raw)
            if (!Number.isFinite(val) || val < 0) {
                alert(`Category "${cat}" MAX must be a number ≥ 0`)
                return
            }
            if (val > perCap) {
                alert(`Category "${cat}" MAX cannot exceed per-beneficiary cap`)
                return
            }
            normalizedLimits[key] = val
        }
        const categories = formData.categories.map(c => String(c).toLowerCase().trim())

        setIsSubmitting(true)
        try {
            const location = formData.locationDistrict
                ? `${formData.locationDistrict}, ${formData.locationState}`
                : formData.locationState

            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    disasterType: formData.disasterType,
                    location: location,
                    stateRegion: formData.locationState,
                    district: formData.locationDistrict,
                    categories,
                    categoryMaxLimits: normalizedLimits,
                    urgency: 'High', // Defaulting for now
                    status: 'Active',
                    totalFundsAllocated: Number(formData.budgetCap) || 0,
                    beneficiaryCap: Number(formData.beneficiaryCap) || 0,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                }),
            })

            if (res.ok) {
                if (onSuccess) onSuccess()
                onClose()
            } else {
                const errorData = await res.json()
                console.error('Failed to create campaign:', errorData)
                alert(`Failed to create campaign: ${errorData.message || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Error submitting campaign:', error)
            alert('An error occurred while creating the campaign.')
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
                        <h2 className="text-2xl font-black text-white tracking-tight">Create Relief Campaign</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                            <span className={`px-2 py-0.5 rounded-full ${step >= 1 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>1</span>
                            <span className={`w-8 h-0.5 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-white/10'}`}></span>
                            <span className={`px-2 py-0.5 rounded-full ${step >= 2 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>2</span>
                            <span className={`w-8 h-0.5 rounded-full ${step >= 3 ? 'bg-accent' : 'bg-white/10'}`}></span>
                            <span className={`px-2 py-0.5 rounded-full ${step >= 3 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>3</span>
                            <span className={`w-8 h-0.5 rounded-full ${step >= 4 ? 'bg-accent' : 'bg-white/10'}`}></span>
                            <span className={`px-2 py-0.5 rounded-full ${step >= 4 ? 'bg-accent text-dark-darker font-bold' : 'bg-white/10'}`}>4</span>
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
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Campaign Identity</h3>
                                    <p className="text-gray-400 text-sm">Define the core details for public and admin tracking.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Campaign Name <span className="text-red-500">*</span></label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-medium"
                                        placeholder="e.g. Assam Flood Relief 2025"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-300 mb-2 block">Disaster Type <span className="text-red-500">*</span></label>
                                        <select
                                            value={formData.disasterType}
                                            onChange={(e) => handleInputChange('disasterType', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-all"
                                        >
                                            <option value="" disabled>Select Type</option>
                                            {DISASTER_TYPES.map(t => <option key={t} value={t} className="bg-dark-darker">{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-300 mb-2 block">Affected Area <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                            <input
                                                value={formData.locationState}
                                                onChange={(e) => handleInputChange('locationState', e.target.value)}
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent/50"
                                                placeholder="Affected Area"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Description <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 h-24"
                                        placeholder="Briefly describe what happened and who is affected..."
                                    ></textarea>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: FUNDING */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Funding & Limits</h3>
                                    <p className="text-gray-400 text-sm">Set hard financial boundaries to prevent misuse.</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3 items-start mb-6">
                                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-200/80">These limits are <strong>hard caps</strong>. The campaign will auto-pause if the total budget is exceeded.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Total Budget Cap (USDC) <span className="text-red-500">*</span></label>
                                    <input
                                        value={formData.budgetCap}
                                        onChange={(e) => handleInputChange('budgetCap', e.target.value)}
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono tracking-wide focus:outline-none focus:border-accent/50"
                                        placeholder="5000000"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-300 mb-2 block">Per-Beneficiary Cap (USDC) <span className="text-red-500">*</span></label>
                                    <input
                                        value={formData.beneficiaryCap}
                                        onChange={(e) => handleInputChange('beneficiaryCap', e.target.value)}
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono tracking-wide focus:outline-none focus:border-accent/50"
                                        placeholder="5000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div className="col-span-2 text-sm font-bold text-gray-400">Campaign Duration <span className="text-red-500">*</span></div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: CONTROLS */}
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                    <AlertOctagon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Allowed Categories</h3>
                                    <p className="text-gray-400 text-sm">Restrict what funds can be spent on.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => toggleCategory(cat)}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.categories.includes(cat)
                                            ? 'bg-accent/10 border-accent text-accent shadow-lg shadow-accent/10'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <span className="font-bold">{cat}</span>
                                        {formData.categories.includes(cat) && <CheckCircle className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                        <AlertOctagon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Campaign-level Category MAXs</h3>
                                        <p className="text-gray-400 text-sm">These are campaign-wide maximum limits, enforced per beneficiary.</p>
                                    </div>
                                </div>
                                {formData.categories.length === 0 && (
                                    <p className="text-sm text-gray-500">Select categories above to set MAX limits.</p>
                                )}
                                {formData.categories.map(cat => (
                                    <div key={cat} className="grid grid-cols-12 gap-3 items-center">
                                        <div className="col-span-6">
                                            <label className="text-xs text-gray-500 mb-1 block">Category</label>
                                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white">{cat}</div>
                                        </div>
                                        <div className="col-span-6">
                                            <label className="text-xs text-gray-500 mb-1 block">MAX per beneficiary (USDC)</label>
                                            <input
                                                value={formData.categoryMaxs[cat] || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, categoryMaxs: { ...prev.categoryMaxs, [cat]: e.target.value } }))}
                                                type="number"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent/50"
                                                placeholder="400"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </motion.div>
                    )}

                    {/* STEP 4: CONFIRMATION */}
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 border border-accent/20">
                                    <CheckCircle className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="text-2xl font-black text-white">Ready to Launch?</h3>
                                <p className="text-gray-400">Review the campaign rules below. These cannot be changed easily once active.</p>
                            </div>

                            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Campaign Name</label>
                                        <div className="text-lg font-bold text-white mt-1">{formData.name || 'Untitled Campaign'}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Budget</label>
                                        <div className="text-lg font-mono font-bold text-accent mt-1">{formData.budgetCap || '0'} USDC</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Location</label>
                                        <div className="text-base text-gray-300 mt-1">{formData.locationState}{formData.locationDistrict ? `, ${formData.locationDistrict}` : ''}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Beneficiary Cap</label>
                                        <div className="text-base font-mono text-gray-300 mt-1">{formData.beneficiaryCap || '0'} USDC / person</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Allowed Categories</label>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.categories.length > 0 ? formData.categories.map(c => (
                                            <span key={c} className="px-3 py-1 rounded-full bg-white/10 border border-white/5 text-sm text-gray-300">{c}</span>
                                        )) : <span className="text-gray-500 italic">No categories selected</span>}
                                    </div>
                                </div>

                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, confirmed: !prev.confirmed }))}>
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.confirmed ? 'bg-accent border-accent' : 'border-gray-500'}`}>
                                    {formData.confirmed && <CheckCircle className="w-3.5 h-3.5 text-dark-darker" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-300 select-none">I confirm that these rules are correct and final.</p>
                                    <p className="text-xs text-gray-500 mt-1">Misconfiguration can lead to funding blocks.</p>
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

                    {step < 4 ? (
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
                            {isSubmitting ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Launch Campaign
                                </>
                            )}
                        </button>
                    )}
                </div>

            </motion.div>
        </div>
    )
}
