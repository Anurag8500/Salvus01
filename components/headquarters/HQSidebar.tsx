"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    ShieldCheck,
    LogOut
} from "lucide-react";

export default function HQSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("salvus_hq_session");
        localStorage.removeItem("salvus_hq_user");
        router.push("/headquarters/login");
    };

    const navItems = [
        { label: "Overview", href: "/headquarters", icon: LayoutDashboard },
        { label: "Requests", href: "/headquarters/requests", icon: FileText },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-72 backdrop-blur-xl bg-[#0f1115]/80 border-r border-white/5 flex flex-col z-50">
            {/* Brand */}
            <div className="h-24 flex items-center px-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                        <ShieldCheck className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <span className="text-white font-bold text-lg tracking-wide block leading-none">SALVUS<span className="text-accent">.</span></span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Headquarters</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/headquarters" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                    ? "bg-accent/10 text-accent font-medium shadow-[0_0_20px_rgba(45,212,191,0.1)] border border-accent/10"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? "text-accent" : "text-slate-500 group-hover:text-slate-300"}`} />
                            <span className="relative z-10">{item.label}</span>

                            {isActive && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-l-full blur-[2px]"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User & Logout */}
            <div className="p-6 border-t border-white/5 bg-black/20">
                <div className="flex items-center mb-6 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-xs font-bold text-white border border-white/10 shadow-inner">
                        HQ
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Super Admin</p>
                        <p className="text-xs text-slate-500 truncate font-mono">admin@salvus.com</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-500/10"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                </button>
            </div>
        </aside>
    );
}
