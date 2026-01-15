import React from 'react';
import { MapPin, Mail, Phone, User, Store, Tag, ShieldCheck, Wallet, Calendar, FileText, AlertCircle } from 'lucide-react';

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
      case 'Verified': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Suspended': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 h-full relative overflow-hidden flex flex-col">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center shadow-lg shrink-0">
              <Store className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{vendor.storeName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${getStatusColor(vendor.status)}`}>
                  {vendor.status}
                </span>
                {vendor.verified && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex-grow overflow-y-auto pr-1 custom-scrollbar">

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Store ID</p>
              <p className="text-xs font-mono text-gray-300 truncate" title={vendor.id}>{vendor.id}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Joined</p>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-300">{vendor.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <User className="w-3 h-3" /> Contact Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <User className="w-4 h-4 text-gray-400" />
                <div className="overflow-hidden">
                  <p className="text-[10px] text-gray-500">Contact Person</p>
                  <p className="text-sm text-gray-200 truncate">{vendor.contactPerson}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <Phone className="w-4 h-4 text-gray-400" />
                <div className="overflow-hidden">
                  <p className="text-[10px] text-gray-500">Phone</p>
                  <p className="text-sm text-gray-200 font-mono">{vendor.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <Mail className="w-4 h-4 text-gray-400" />
                <div className="overflow-hidden">
                  <p className="text-[10px] text-gray-500">Email</p>
                  <p className="text-sm text-gray-200 truncate" title={vendor.email}>{vendor.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Location
            </h3>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-200">{vendor.area}</p>
                <p className="text-xs text-gray-400 mt-0.5">{vendor.district}, {vendor.state}</p>
              </div>
            </div>
          </div>

          {/* Compliance & Wallet */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Compliance & Finance
            </h3>
            <div className="space-y-2">
              {vendor.walletAddress && (
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-purple-300 font-medium">Wallet Connected</span>
                  </div>
                  <p className="text-[10px] font-mono text-purple-200/70 truncate">{vendor.walletAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Tag className="w-3 h-3" /> Authorized Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {vendor.allowedCategories.map((category) => (
                <span
                  key={category}
                  className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-medium text-gray-300"
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
