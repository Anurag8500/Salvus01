"use client";

import Link from "next/link";
import {
    Users,
    Clock,
    CheckCircle,
    XCircle,
    ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "@/components/headquarters/StatCard";
import StatusBadge from "@/components/headquarters/StatusBadge";

interface RequestItem {
    id: string;
    organizationName: string;
    organizationType: string;
    officialEmail: string;
    status: "Pending" | "Approved" | "Rejected";
    createdAt: string;
}

export default function HeadquartersDashboard() {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/campaign-requests");
                if (!res.ok) throw new Error("Failed to load requests");
                const data = await res.json();
                const mapped: RequestItem[] = (data || []).map((r: any) => ({
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

    const total = requests.length;
    const pending = requests.filter(r => r.status === "Pending").length;
    const approved = requests.filter(r => r.status === "Approved").length;
    const rejected = requests.filter(r => r.status === "Rejected").length;

    const recent = requests.slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-400 mt-2">Realtime campaign requests from the network.</p>
                </div>
                <div className="text-sm font-mono text-accent/80 bg-accent/5 px-3 py-1 rounded border border-accent/10">
                    SYSTEM STATUS: ONLINE
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Requests" value={total} icon={Users} color="blue" />
                <StatCard title="Pending Actions" value={pending} icon={Clock} color="amber" />
                <StatCard title="Active Partners" value={approved} icon={CheckCircle} color="emerald" />
                <StatCard title="Rejected" value={rejected} icon={XCircle} color="red" />
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <h2 className="font-bold text-lg text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-accent rounded-full"></span>
                        Recent Campaign Requests
                    </h2>
                    <Link href="/headquarters/requests" className="text-sm text-slate-400 hover:text-white flex items-center font-medium transition-colors group">
                        View All <ArrowRight className="w-4 h-4 ml-2 text-accent group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="px-8 py-10 text-slate-500">Loading...</div>
                    ) : error ? (
                        <div className="px-8 py-10 text-red-400">{error}</div>
                    ) : recent.length === 0 ? (
                        <div className="px-8 py-10 text-slate-500">No requests yet.</div>
                    ) : (
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-white/[0.03] text-slate-200 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-8 py-4">Organization</th>
                                <th className="px-8 py-4">Type</th>
                                <th className="px-8 py-4">Submitted</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recent.map((req) => (
                                <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                                {req.organizationName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white group-hover:text-accent transition-colors">{req.organizationName}</p>
                                                <p className="text-xs text-slate-500 font-mono">{req.officialEmail}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${req.organizationType === 'Govt' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 'bg-slate-700/30 text-slate-300 border-slate-600/30'}`}>
                                            {req.organizationType}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 font-mono text-xs">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-4">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <Link
                                            href={`/headquarters/requests/${req.id}`}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>
        </div>
    );
}
