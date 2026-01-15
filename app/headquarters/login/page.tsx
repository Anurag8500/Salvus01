"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeadquartersLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        setTimeout(() => {
            if (email === "admin@salvus.com" && password === "admin123") {
                localStorage.setItem("salvus_hq_session", "true");
                localStorage.setItem("salvus_hq_user", email);
                router.push("/headquarters");
            } else {
                setError("Invalid credentials. Access denied.");
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f1115]">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-md p-1"
            >
                <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl">
                    {/* Header */}
                    <div className="p-8 pb-0 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6 neon-border relative group">
                            <ShieldCheck className="w-8 h-8 text-accent group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 rounded-full bg-accent/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Salvus<span className="text-accent">.</span> HQ</h1>
                        <p className="text-slate-400 text-sm">Secure Command Center</p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center backdrop-blur-md"
                                >
                                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider group-focus-within:text-accent transition-colors">
                                        Official Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                                        placeholder="admin@salvus.com"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider group-focus-within:text-accent transition-colors">
                                        Secure Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5 group-focus-within:text-accent transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-dark-darker bg-gradient-to-r from-accent to-teal-400 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center group ${loading ? "opacity-70 cursor-wait" : ""
                                    }`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-dark-darker/30 border-t-dark-darker rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Authenticate <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="px-8 py-4 bg-white/5 border-t border-white/5 text-center">
                        <p className="text-[10px] text-slate-500 font-mono">
                            RESTRICTED SYSTEM • UNAUTHORIZED ACCESS LOGGED
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
