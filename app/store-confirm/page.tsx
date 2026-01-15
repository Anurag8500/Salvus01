'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

type TxnStatus = 'loading' | 'pending' | 'completed' | 'expired' | 'already' | 'invalid'

export default function StoreConfirmPage() {
  const searchParams = useSearchParams()
  const txn = searchParams.get('txn') || ''

  const [status, setStatus] = useState<TxnStatus>('loading')
  const [confirming, setConfirming] = useState(false)

  const details = useMemo(
    () => ({
      beneficiaryId: 'BEN-4821',
      category: 'Food',
      items: 'Rice, pulses, cooking oil',
      amount: 500,
    }),
    []
  )

  useEffect(() => {
    if (!txn) {
      setStatus('invalid')
      return
    }
    const lowercase = txn.toLowerCase()
    if (lowercase.includes('expired')) {
      setStatus('expired')
      return
    }
    if (lowercase.includes('done') || lowercase.includes('completed') || lowercase.includes('paid')) {
      setStatus('already')
      return
    }
    const t = setTimeout(() => setStatus('pending'), 400)
    return () => clearTimeout(t)
  }, [txn])

  const canConfirm = status === 'pending' && !confirming

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-dark-darker via-dark-darker to-dark px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">SALVUS</h1>
          <p className="text-gray-400 text-sm mt-1">Store Sale Confirmation</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-6 border border-dark-lighter/50"
        >
          <div className="mb-4">
            {status === 'loading' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-semibold">Checking transaction</span>
              </div>
            )}
            {status === 'pending' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <span className="text-xs font-semibold">🟡 Pending Confirmation</span>
              </div>
            )}
            {status === 'completed' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                <span className="text-xs font-semibold">🟢 Completed</span>
              </div>
            )}
            {status === 'expired' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <span className="text-xs font-semibold">🔴 Expired</span>
              </div>
            )}
            {status === 'already' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <span className="text-xs font-semibold">🟢 Already Completed</span>
              </div>
            )}
            {status === 'invalid' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <span className="text-xs font-semibold">🔴 Invalid Link</span>
              </div>
            )}
          </div>

          {status === 'invalid' && (
            <div className="text-center py-6">
              <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <div className="text-white font-semibold mb-1">This confirmation link is invalid</div>
              <div className="text-gray-400 text-sm">Please contact the relief coordinator.</div>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center py-6">
              <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <div className="text-white font-semibold mb-1">This confirmation link has expired</div>
              <div className="text-gray-400 text-sm">Please contact the relief coordinator.</div>
            </div>
          )}

          {status === 'already' && (
            <div className="text-center py-6">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <div className="text-white font-semibold mb-1">This sale has already been confirmed</div>
              <div className="text-gray-400 text-sm">Payment has already been processed.</div>
            </div>
          )}

          {(status === 'pending' || status === 'completed') && (
            <>
              <div className="glass rounded-xl p-4 border border-dark-lighter/50 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-400">Beneficiary ID</div>
                  <div className="text-white font-semibold text-sm">{details.beneficiaryId}</div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-400">Category</div>
                  <div className="text-white font-semibold text-sm">{details.category}</div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-400">Items</div>
                  <div className="text-white text-sm">{details.items}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">Amount</div>
                  <div className="text-2xl font-extrabold text-white">{details.amount.toLocaleString()} USDC</div>
                </div>
              </div>

              {status === 'pending' && (
                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={!canConfirm}
                    onClick={async () => {
                      setConfirming(true)
                      await new Promise((r) => setTimeout(r, 700))
                      setStatus('completed')
                      setConfirming(false)
                    }}
                    className="w-full py-3.5 rounded-lg bg-gradient-to-r from-accent to-accent-light hover:from-accent-dark hover:to-accent text-white font-semibold shadow-lg shadow-accent/20 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {confirming ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    <span>Confirm Sale</span>
                  </button>
                  <button
                    type="button"
                    disabled={confirming}
                    className="w-full py-3.5 rounded-lg bg-dark-lighter/40 hover:bg-dark-lighter/50 text-gray-300 font-semibold border border-dark-lighter/60 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {status === 'completed' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-white font-semibold mb-1">Payment sent via UPI ✔</div>
                  <div className="text-gray-400 text-sm mb-4">You may close this page.</div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 rounded-lg bg-gradient-to-r from-accent to-accent-light text-white font-semibold opacity-60 cursor-not-allowed"
                    >
                      Confirm Sale
                    </button>
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 rounded-lg bg-dark-lighter/40 text-gray-300 border border-dark-lighter/60 opacity-60 cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

