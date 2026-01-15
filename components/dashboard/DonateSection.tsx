'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, X, CheckCircle, MapPin, Users, Loader2 } from 'lucide-react'
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

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch campaigns
  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/campaigns')
      const data = await res.json()
      const active = (data || []).filter((c: any) => c.status === 'Active')
      setCampaigns(active)
    }
    load()
  }, [])

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      alert('Connect wallet first')
      return
    }

    const campaign = campaigns.find(c => c._id === selectedCampaign)
    if (!campaign?.escrowAddress) {
      alert('Campaign not deployed on-chain')
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

      // ✅ CRITICAL FIX: WAIT FOR CONFIRMATION
      setProcessStep('Waiting for approval confirmation...')
      if (!publicClient) {
        throw new Error("wagmi usePublicClient returned undefined");
      }
      await publicClient.waitForTransactionReceipt({
        hash: approveHash
      })

      // -----------------------------
      // STEP 2 — DONATE
      // -----------------------------
      setProcessStep('Donating...')

      const donateHash = await writeContractAsync({
        address: campaign.escrowAddress,
        abi: CAMPAIGN_ABI,
        functionName: 'donate',
        args: [parsedAmount]
      })

      setDonationDetails({
        amount,
        campaign: campaign.name,
        txHash: donateHash,
        timestamp: new Date().toLocaleString()
      })

      setShowModal(true)
    } catch (err: any) {
      console.error(err)
      alert(err.shortMessage || err.message || 'Donation failed')
    } finally {
      setIsProcessing(false)
      setProcessStep('')
    }
  }

  return (
    <>
      <motion.div className="glass-card p-8 rounded-3xl">
        <h2 className="text-2xl font-bold text-white mb-6">Make a Donation</h2>

        <form onSubmit={handleDonate} className="space-y-6">
          {/* Campaign selector */}
          <select
            className="w-full p-3 rounded bg-black text-white"
            value={selectedCampaign}
            onChange={e => setSelectedCampaign(e.target.value)}
            required
          >
            <option value="">Select Campaign</option>
            {campaigns.map(c => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Amount */}
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Amount in USDC"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full p-3 rounded bg-black text-white"
            required
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-accent text-black font-bold rounded"
          >
            {isProcessing ? processStep || 'Processing…' : 'Confirm Donation'}
          </button>
        </form>
      </motion.div>

      {/* Confirmation Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showModal && donationDetails && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <motion.div className="bg-black p-6 rounded-xl w-full max-w-md">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Donation Successful 🎉
                  </h3>
                  <p className="text-gray-300">
                    Amount: {donationDetails.amount} USDC
                  </p>
                  <p className="text-gray-300">
                    Campaign: {donationDetails.campaign}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Tx: {donationDetails.txHash}
                  </p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-4 w-full py-2 bg-accent text-black rounded"
                  >
                    Close
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
