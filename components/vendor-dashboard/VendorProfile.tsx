import React from 'react';
import { MapPin, Mail, Phone, User, Store, Tag, ShieldCheck, Wallet, Calendar, FileText, AlertCircle, Copy } from 'lucide-react';

interface VendorProfileProps {
  vendor: {
    id: string;
    storeName: string;
    contactPerson: string;
    vendorType: string;
    state: string;
    district: string;
    area: string;
    phone: string;
    email: string;
    allowedCategories: string[];
    // New fields
    status: string;
    verified: boolean;
    walletAddress: string;
    joinDate: string;
    riskLevel: string;
    businessProofType: string;
  };
}

const VendorProfile: React.FC<VendorProfileProps> = ({ vendor }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Suspended': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl p-8 h-full relative overflow-hidden flex flex-col group hover:border-white/10 transition-colors duration-300">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all duration-700 group-hover:bg-accent/10"></div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 flex items-center justify-center shadow-lg shrink-0">
              <Store className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Merchant Profile</p>
              <h2 className="text-xl font-bold text-white leading-tight mb-2">{vendor.storeName}</h2>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border flex items-center gap-1.5 ${getStatusColor(vendor.status)}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${vendor.status === 'Verified' ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
                  {vendor.status}
                </span>
                {vendor.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                    <ShieldCheck className="w-3 h-3" /> KYC VERIFIED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 flex-grow overflow-y-auto pr-2 custom-scrollbar">

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Store ID</p>
              <p className="text-xs font-mono text-gray-300 truncate opacity-80" title={vendor.id}>{vendor.id}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Joined On</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-300">{vendor.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-accent" /> Contact Information
            </h3>
            <div className="space-y-3">
              <div className="group/item flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover/item:text-white transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Manager</p>
                  <p className="text-sm font-medium text-gray-200 truncate">{vendor.contactPerson}</p>
                </div>
              </div>
              <div className="group/item flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover/item:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-medium text-gray-200 font-mono">{vendor.phone}</p>
                </div>
              </div>
              <div className="group/item flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover/item:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-gray-200 truncate" title={vendor.email}>{vendor.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-accent" /> Location
            </h3>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0A0A0A] border border-white/5">
              <MapPin className="w-5 h-5 text-gray-500 mt-1 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">{vendor.area}</p>
                <p className="text-xs text-gray-400 mt-1">{vendor.district}, {vendor.state}</p>
              </div>
            </div>
          </div>

          {/* Wallet */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-accent" /> Settlement Wallet
            </h3>
            <div className="space-y-2">
              {vendor.walletAddress ? (
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 group/wallet hover:bg-purple-500/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                    <span className="text-xs text-purple-300 font-bold uppercase tracking-wide">Connected</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-mono text-purple-200/80 break-all leading-relaxed">
                      {vendor.walletAddress}
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(vendor.walletAddress)}
                      className="p-2 hover:bg-purple-400/20 rounded-lg transition-colors shrink-0 text-purple-300"
                      title="Copy Address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/5 text-center text-gray-400 text-xs">
                  No wallet linked.
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-accent" /> Authorized Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {vendor.allowedCategories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-[11px] font-medium text-gray-300 hover:border-accent/30 transition-colors cursor-default"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
