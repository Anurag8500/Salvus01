'use client'

import { useEffect, useState } from 'react';

export default function ImpactBreakdown() {
  const [impact, setImpact] = useState<{ purchases: number, vendors: number, categories: string[] } | null>(null);
  useEffect(() => {
    fetch('/api/donor-impact')
      .then(res => res.json())
      .then(data => setImpact(data.impact || null));
  }, []);
  const empty = !impact || (!impact.purchases && !impact.vendors && (!impact.categories || impact.categories.length === 0));
  return (
    <div className="glass-card p-8 rounded-3xl mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Impact Breakdown</h2>
      {empty ? (
        <div className="text-gray-400">Funds are securely held in escrow and will be released after verification.</div>
      ) : (
        <div className="space-y-2">
          {impact.purchases > 0 && (
            <div className="text-white">Your donations helped fund <span className="font-bold">{impact.purchases}</span> verified purchase{impact.purchases > 1 ? 's' : ''}.</div>
          )}
          {impact.vendors > 0 && (
            <div className="text-white">Your contribution supported <span className="font-bold">{impact.vendors}</span> vendor{impact.vendors > 1 ? 's' : ''}.</div>
          )}
          {impact.categories && impact.categories.length > 0 && (
            <div className="text-white">Your funds contributed to <span className="font-bold">{impact.categories.join(', ')}</span>.</div>
          )}
        </div>
      )}
    </div>
  );
}
