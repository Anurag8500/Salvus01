"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    Globe,
    FileText,
    AlertTriangle,
    Download,
    User,
    ShieldAlert,
    ShieldCheck
} from "lucide-react";
import StatusBadge from "@/components/headquarters/StatusBadge";
import RequestActionModal from "@/components/headquarters/RequestActionModal";

interface RequestData {
    id: string;
    organizationName: string;
    organizationType: string;
    regNumber?: string;
    website?: string;
    createdAt: string;
    contactPerson: string;
    officialEmail: string;
    phone: string;
    headOfficeLocation?: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
    documents: { filename: string; size: number; mimeType: string }[];
}

export default function RequestDetailPage({ params }: { params: { id: string } }) {
    const [data, setData] = useState<RequestData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<"Pending" | "Approved" | "Rejected">("Pending");
    const [modalType, setModalType] = useState<"approve" | "reject" | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/campaign-requests/${params.id}`);
                if (!res.ok) throw new Error("Failed to load request");
                const r = await res.json();
                setData(r);
                setStatus(r.status);
            } catch (e: any) {
                setError(e?.message || "Unable to fetch request");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [params.id]);

    const formattedDocs = useMemo(() => {
        return (data?.documents || []).map(d => {
            const mb = (d.size / (1024 * 1024));
            return { name: d.filename, sizeText: `${mb.toFixed(2)} MB`, mimeType: d.mimeType };
        });
    }, [data]);

    const handleAction = async () => {
        try {
            if (modalType === "approve") {
                const res = await fetch(`/api/campaign-requests/${params.id}/approve`, { method: "POST" });
                if (!res.ok) {
                    const d = await res.json().catch(() => ({}));
                    throw new Error(d?.message || "Approval failed");
                }
                setStatus("Approved");
            }
        } catch (e: any) {
            setError(e?.message || "Action failed");
        } finally {
            setModalType(null);
        }
    };

    if (loading) {
        return <div className="px-8 py-10 text-slate-500">Loading...</div>;
    }
    if (error || !data) {
        return <div className="px-8 py-10 text-red-400">{error || "Not found"}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-10">
                <Link href="/headquarters/requests" className="inline-flex items-center text-sm text-slate-500 hover:text-white mb-6 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Requests
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <StatusBadge status={status} />
                            <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded">ID: {data.id}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">{data.organizationName}</h1>
                        <p className="text-slate-400 flex items-center">
                            <Building2 className="w-4 h-4 mr-2 text-accent" />
                            {data.organizationType} • Submitted on {new Date(data.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    {status === "Pending" && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => setModalType("reject")}
                                className="px-6 py-3 rounded-xl border border-red-500/20 text-red-400 font-bold hover:bg-red-500/10 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => setModalType("approve")}
                                className="px-8 py-3 rounded-xl bg-accent text-dark-darker font-bold hover:bg-teal-300 transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:scale-105 active:scale-95"
                            >
                                Approve & Register
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    <section className="glass-panel p-8 rounded-3xl">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <User className="w-5 h-5 text-accent" />
                            Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Contact Person</label>
                                <p className="text-white font-medium text-lg">{data.contactPerson}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Official Email</label>
                                <p className="text-white font-medium text-lg">{data.officialEmail}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Phone</label>
                                <p className="text-white font-medium text-lg">{data.phone}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Website</label>
                                {data.website ? (
                                    <a href={`https://${data.website}`} target="_blank" className="text-accent hover:text-teal-300 font-medium text-lg hover:underline flex items-center">
                                        {data.website} <Globe className="w-4 h-4 ml-2" />
                                    </a>
                                ) : (
                                    <p className="text-slate-500">—</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="glass-panel p-8 rounded-3xl">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-accent" />
                            Organization Details
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Registration Number</label>
                                <p className="text-white font-mono text-lg bg-black/20 inline-block px-4 py-2 rounded-lg border border-white/5">
                                    {data.regNumber || "—"}
                                </p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Head Office Location</label>
                                <p className="text-white font-medium text-lg">{data.headOfficeLocation || "—"}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Mission Statement</label>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/30 rounded-full"></div>
                                    <p className="text-slate-300 italic pl-5 py-1 text-lg leading-relaxed">
                                        "{data.reason}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="glass-panel p-6 rounded-2xl">
                        <h3 className="font-bold text-white mb-4 flex items-center text-sm uppercase tracking-wide">
                            <FileText className="w-4 h-4 mr-2 text-slate-500" />
                            Submitted Documents
                        </h3>
                        <div className="space-y-3">
                            {formattedDocs.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:border-white/20 transition-all bg-white/[0.02] hover:bg-white/[0.05] group">
                                    <div className="flex items-center overflow-hidden">
                                        <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 mr-3 border border-red-500/20">
                                            <span className="text-[10px] font-bold">{doc.name.toLowerCase().endsWith(".pdf") ? "PDF" : "FILE"}</span>
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{doc.name}</p>
                                            <p className="text-xs text-slate-500">{doc.sizeText}</p>
                                        </div>
                                    </div>
                                    <a
                                      href={`/api/campaign-requests/${data.id}/documents/${i}`}
                                      className="text-slate-500 hover:text-accent transition-colors p-2"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                </div>
                            ))}
                            {formattedDocs.length === 0 && <p className="text-slate-500 text-sm">No documents submitted.</p>}
                        </div>
                    </section>

                    <section className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                        <h3 className="font-bold text-white mb-6 flex items-center text-sm uppercase tracking-wide">
                            <ShieldCheck className="w-4 h-4 mr-2 text-slate-500" />
                            Audit Traceability
                        </h3>
                        <div className="relative border-l border-white/10 ml-2 space-y-8 py-2">
                            <div className="pl-6 relative">
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-slate-600"></div>
                                <p className="text-[10px] text-slate-500 font-mono mb-1">{new Date(data.createdAt).toLocaleString()}</p>
                                <p className="text-sm font-bold text-white mb-0.5">Submitted</p>
                                <p className="text-xs text-slate-400">By: System</p>
                            </div>
                            {status !== "Pending" && (
                                <div className="pl-6 relative">
                                    <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${status === 'Approved' ? 'bg-accent border-accent shadow-[0_0_10px_rgba(45,212,191,0.5)]' : 'bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                                    <p className="text-[10px] text-accent font-mono mb-1">Just Now</p>
                                    <p className={`text-sm font-bold ${status === 'Approved' ? 'text-accent' : 'text-red-400'}`}>
                                        Request {status}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        By: Super Admin
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <RequestActionModal
                isOpen={!!modalType}
                onClose={() => setModalType(null)}
                type={modalType as "approve" | "reject"}
                onConfirm={handleAction}
                orgName={data.organizationName}
            />
        </div>
    );
}
