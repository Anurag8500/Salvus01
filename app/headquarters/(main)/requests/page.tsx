"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import StatusBadge from "@/components/headquarters/StatusBadge";

interface CampaignRequest {
    id: string;
    organizationName: string;
    organizationType: string;
    officialEmail: string;
    status: "Pending" | "Approved" | "Rejected";
    createdAt: string;
}

export default function RequestsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [requests, setRequests] = useState<CampaignRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/campaign-requests");
                if (!res.ok) throw new Error("Failed to load requests");
                const data = await res.json();
                const mapped: CampaignRequest[] = (data || []).map((r: any) => ({
                    id: r.id,
                    organizationName: r.organizationName,
                    organizationType: r.organizationType,
                    officialEmail: r.officialEmail,
                    status: r.status,
                    createdAt: r.createdAt,
                }));
                setRequests(mapped);
            } catch (e: any) {
                setError(e?.message || "Unable to fetch requests");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredRequests = requests.filter((req) => {
        const matchesSearch =
            req.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.officialEmail.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || req.status === statusFilter;
        const matchesType = typeFilter === "All" || req.organizationType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Campaign Requests</h1>
                    <p className="text-slate-400 mt-2">Manage and verify incoming relief campaign applications.</p>
                </div>
            </div>

            <div className="glass-panel p-2 rounded-2xl flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search organizations or emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-slate-600 focus:outline-none focus:bg-white/5 rounded-xl transition-colors"
                    />
                </div>
                <div className="h-8 w-[1px] bg-white/10 self-center hidden md:block"></div>
                <div className="flex gap-2 p-1">
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-4 pr-10 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 text-sm rounded-lg border-none outline-none appearance-none cursor-pointer min-w-[140px] transition-colors"
                        >
                            <option value="All" className="bg-[#0f1115]">All Status</option>
                            <option value="Pending" className="bg-[#0f1115]">Pending</option>
                            <option value="Approved" className="bg-[#0f1115]">Approved</option>
                            <option value="Rejected" className="bg-[#0f1115]">Rejected</option>
                        </select>
                        <Filter className="absolute right-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="pl-4 pr-10 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 text-sm rounded-lg border-none outline-none appearance-none cursor-pointer min-w-[140px] transition-colors"
                        >
                            <option value="All" className="bg-[#0f1115]">All Types</option>
                            <option value="NGO" className="bg-[#0f1115]">NGO</option>
                            <option value="Govt" className="bg-[#0f1115]">Government</option>
                        </select>
                        <div className="absolute right-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="px-8 py-10 text-slate-500">Loading...</div>
                    ) : error ? (
                        <div className="px-8 py-10 text-red-400">{error}</div>
                    ) : (
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-white/[0.03] text-slate-200 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-8 py-4">Organization</th>
                                <th className="px-8 py-4">Type</th>
                                <th className="px-8 py-4">Submission Date</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                                    {req.organizationName.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white group-hover:text-accent transition-colors">{req.organizationName}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{req.officialEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${req.organizationType === 'Govt' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 'bg-slate-700/30 text-slate-300 border-slate-600/30'}`}>
                                                {req.organizationType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 font-mono text-xs text-slate-500">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-4">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <Link
                                                href={`/headquarters/requests/${req.id}`}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-white/10 rounded-lg text-xs font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all bg-white/5"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <Search className="w-12 h-12 mb-4 opacity-20" />
                                            <p>No requests found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    )}
                </div>
                <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-xs text-slate-500">
                    <span>Showing {filteredRequests.length} results</span>
                    <div className="flex gap-2">
                        <button disabled className="px-4 py-2 border border-white/10 rounded-lg bg-white/5 opacity-50 cursor-not-allowed">Previous</button>
                        <button disabled className="px-4 py-2 border border-white/10 rounded-lg bg-white/5 opacity-50 cursor-not-allowed">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
