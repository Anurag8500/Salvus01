import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: "blue" | "emerald" | "amber" | "red";
}

export default function StatCard({ title, value, icon: Icon, trend, color = "blue" }: StatCardProps) {
    const colors = {
        blue: "from-blue-500 to-cyan-400 text-blue-400",
        emerald: "from-emerald-500 to-teal-400 text-emerald-400",
        amber: "from-amber-500 to-orange-400 text-amber-400",
        red: "from-red-500 to-pink-500 text-red-400",
    };

    const bgColors = {
        blue: "bg-blue-500/10 border-blue-500/20",
        emerald: "bg-emerald-500/10 border-emerald-500/20",
        amber: "bg-amber-500/10 border-amber-500/20",
        red: "bg-red-500/10 border-red-500/20",
    };

    return (
        <div className="glass-card p-6 rounded-2xl relative group overflow-hidden transition-all duration-300 hover:translate-y-[-2px]">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                <Icon className="w-24 h-24" />
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${bgColors[color]} backdrop-blur-md shadow-lg`}>
                    <Icon className={`w-6 h-6 ${colors[color].split(' ').pop()}`} />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-sm relative z-10">
                    <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded flex items-center border border-emerald-400/20">
                        {trend}
                    </span>
                    <span className="text-slate-500 ml-2 text-xs">vs last month</span>
                </div>
            )}
        </div>
    );
}
