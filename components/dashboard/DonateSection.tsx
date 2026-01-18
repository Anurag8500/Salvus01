'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, X, CheckCircle, MapPin, Users, Loader2, DollarSign, Wallet, ChevronDown, Coins, ExternalLink } from 'lucide-react'
import {
  useAccount,
  useWriteContract,
  usePublicClient
} from 'wagmi'
import { parseUnits } from 'viem'

// --------------------
// ABIs
// --------------------
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
]

const CAMPAIGN_ABI = [
  {
    name: 'donate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: []
  }
]

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`
if (!USDC_ADDRESS) {
  throw new Error("NEXT_PUBLIC_USDC_ADDRESS is missing");
}

export default function DonateSection() {
  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processStep, setProcessStep] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [donationDetails, setDonationDetails] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Pre-fill from session storage if available
  useEffect(() => {
    setMounted(true)
    const storedId = sessionStorage.getItem('selectedCampaignId')
    if (storedId) {
      setSelectedCampaign(storedId)
      // Clear it so it doesn't persist forever
      sessionStorage.removeItem('selectedCampaignId')
    }
  }, [])

  // Fetch campaigns
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/campaigns')
        const data = await res.json()
        const active = (data || []).filter((c: any) => c.status === 'Active')
        setCampaigns(active)
      } catch (e) {
        console.error("Failed to load campaigns for dropdown", e)
      }
    }
    load()
  }, [])

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      alert('Please connect your wallet first.')
      return
    }

    const campaign = campaigns.find(c => c._id === selectedCampaign)
    if (!campaign?.escrowAddress) {
      alert('This campaign is not yet deployed on-chain.')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount.')
      return
    }

    try {
      setIsProcessing(true)

      const parsedAmount = parseUnits(amount, 6)

      // -----------------------------
      // STEP 1 — APPROVE USDC
      // -----------------------------
      setProcessStep('Approving USDC...')

      const approveHash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [campaign.escrowAddress, parsedAmount]
      })

      setProcessStep('Confirming Approval...')
      if (!publicClient) {
        throw new Error("wagmi usePublicClient returned undefined");
      }
      await publicClient.waitForTransactionReceipt({
        hash: approveHash
      })

      // -----------------------------
      // STEP 2 — DONATE
      // -----------------------------
      setProcessStep('Finalizing Donation...')

      const donateHash = await writeContractAsync({
        address: campaign.escrowAddress,
        abi: CAMPAIGN_ABI,
        functionName: 'donate',
        args: [parsedAmount]
      })

      setProcessStep('Verifying Transaction...')
      await publicClient.waitForTransactionReceipt({
        hash: donateHash
      })

      setDonationDetails({
        amount,
        campaign: campaign.name,
        txHash: donateHash,
        timestamp: new Date().toLocaleString()
      })

      setShowModal(true)
      setAmount('')
    } catch (err: any) {
      console.error(err)
      alert(err.shortMessage || err.message || 'Donation failed. Please try again.')
    } finally {
      setIsProcessing(false)
      setProcessStep('')
    }
  }

  const selectedCampaignData = campaigns.find(c => c._id === selectedCampaign)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card-premium relative overflow-hidden rounded-3xl p-1" // minimal padding for border effect
      >
        {/* Animated Border Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-purple-500/20 opacity-50 pointer-events-none"></div>

        <div className="bg-[#0A0A0A]/90 backdrop-blur-xl rounded-[22px] p-8 md:p-10 relative z-10 h-full">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Left Side: Context */}
            <div className="md:w-1/3 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                  Make a <span className="text-accent">Difference</span>
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  Your contributions are held in a smart contract escrow and released only when vendors verify delivery.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span>100% Transparent</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <span>Direct to Vendors</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span>Instant Tax Receipts</span>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="md:w-2/3 bg-white/5 rounded-2xl p-6 border border-white/5">
              <form onSubmit={handleDonate} className="space-y-8">
                {/* Custom Campaign Select Dropdown */}
                <div className="space-y-3 relative z-50">
                  <label className="text-sm font-medium text-gray-400 ml-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    Select Campaign
                  </label>

                  <div className="relative">
                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full p-4 rounded-xl text-left flex items-center justify-between border transition-all duration-300 outline-none focus:ring-2 focus:ring-accent/50 ${isDropdownOpen ? 'bg-white/10 border-accent/50 text-white' : 'bg-black/50 border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20'}`}
                    >
                      <span className={`font-medium ${selectedCampaignData ? 'text-white' : 'text-gray-500'}`}>
                        {selectedCampaignData ? selectedCampaignData.name : 'Choose a verified campaign...'}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? '-rotate-180' : 'rotate-0'}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#151515] border border-white/10 rounded-xl shadow-2xl z-[60] max-h-72 overflow-y-auto custom-scrollbar backdrop-blur-3xl"
                        >
                          {campaigns.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No active campaigns found.</div>
                          ) : (
                            campaigns.map(c => (
                              <button
                                key={c._id}
                                type="button"
                                onClick={() => {
                                  setSelectedCampaign(c._id)
                                  setIsDropdownOpen(false)
                                }}
                                className={`w-full text-left p-3.5 rounded-lg flex items-center justify-between group transition-all mb-1 last:mb-0 ${selectedCampaign === c._id ? 'bg-accent/10 border border-accent/20' : 'hover:bg-white/5 border border-transparent'}`}
                              >
                                <div>
                                  <div className={`font-semibold text-base ${selectedCampaign === c._id ? 'text-accent' : 'text-gray-200 group-hover:text-white'}`}>{c.name}</div>
                                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {c.location || 'Global'}
                                  </div>
                                </div>
                                {selectedCampaign === c._id && <CheckCircle className="w-5 h-5 text-accent" />}
                              </button>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Overlay to close */}
                    {isDropdownOpen && (
                      <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsDropdownOpen(false)}
                      ></div>
                    )}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-3 relative z-10">
                  <label className="text-sm font-medium text-gray-400 ml-1 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-accent" />
                    Donation Amount (USDC)
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-accent transition-colors" />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full p-4 pl-12 rounded-xl bg-black/50 border border-white/10 text-white text-lg font-bold tracking-wide focus:outline-none focus:border-accent/50 focus:bg-black/80 transition-all placeholder:text-gray-700"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-white/5 rounded text-xs text-gray-500 font-mono">
                      USDC
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${isProcessing ? 'bg-gray-800 cursor-not-allowed text-gray-500 border border-white/5' : 'bg-gradient-to-r from-accent to-accent-light hover:from-accent-dark hover:to-accent text-black shadow-lg shadow-accent/20 hover:shadow-accent/40'}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{processStep || 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Donation</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showModal && donationDetails && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] px-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl w-full max-w-md relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-purple-500 to-accent"></div>

                  <div className="text-center mb-8 mt-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-6 border border-green-500/20"
                    >
                      <CheckCircle className="w-10 h-10" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-white mb-2">Thank You!</h3>
                    <p className="text-gray-400">Your contribution makes a real difference.</p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 space-y-4 mb-8 border border-white/5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Amount Donated</span>
                      <span className="text-white font-bold text-lg">{donationDetails.amount} USDC</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Campaign</span>
                      <span className="text-white font-medium text-right max-w-[60%] truncate">{donationDetails.campaign}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Date</span>
                      <span className="text-gray-300 font-mono text-xs bg-black/30 px-2 py-1 rounded">{donationDetails.timestamp}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <a
                      href={`https://scan.testnet.monad.xyz/tx/${donationDetails.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center w-full py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/5 hover:border-white/20 group"
                    >
                      <span className="mr-2">View Transaction</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </a>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full py-3.5 bg-accent text-black rounded-xl font-bold hover:bg-accent-dark transition-colors shadow-lg shadow-accent/10"
                    >
                      Close Receipt
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
