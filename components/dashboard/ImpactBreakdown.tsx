'use client'

import { useEffect, useState } from 'react';
import { ShoppingBag, Store, Tag, Sparkles } from 'lucide-react';

export default function ImpactBreakdown() {
  const [impact, setImpact] = useState<{ purchases: number, vendors: number, categories: string[] } | null>(null);
  useEffect(() => {
    fetch('/api/donor-impact')
      .then(res => res.json())
      .then(data => setImpact(data.impact || null));
  }, []);

  const empty = !impact || (!impact.purchases && !impact.vendors && (!impact.categories || impact.categories.length === 0));

  return (
    <div className="glass-card-premium rounded-3xl p-6 border border-white/5 relative overflow-hidden">
      {/* Background Sparkle */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none"></div>

      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        Real-World Impact
      </h2>

      {empty ? (
        <div className="text-center py-8 px-4 rounded-xl bg-white/5 border border-dashed border-white/10">
          <p className="text-gray-400 text-sm">Funds are securely held in escrow and will be released after verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Purchases Card */}
          {impact.purchases > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 flex flex-col items-start gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{impact.purchases}</div>
                <div className="text-xs text-blue-200/70 uppercase tracking-wide font-semibold">Verified Purchases</div>
              </div>
            </div>
          )}

          {/* Vendors Card */}
          {impact.vendors > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 flex flex-col items-start gap-2">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{impact.vendors}</div>
                <div className="text-xs text-purple-200/70 uppercase tracking-wide font-semibold">Vendors Supported</div>
              </div>
            </div>
          )}

          {/* Categories Card (Span full width if needed) */}
          {impact.categories && impact.categories.length > 0 && (
            <div className="sm:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm font-medium">
                <Tag className="w-4 h-4" />
                <span>Sectors Impacted</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {impact.categories.map((cat, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/10 text-white border border-white/10">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

