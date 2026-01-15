export default function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Pending: "bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
        Approved: "bg-accent/10 text-accent border-accent/20 shadow-[0_0_10px_rgba(45,212,191,0.1)]",
        Rejected: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
        New: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };

    const defaultStyle = "bg-slate-700/30 text-slate-300 border-slate-600/30";

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-all duration-300 hover:brightness-110 ${styles[status] || defaultStyle
                }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'Approved' ? 'bg-accent animate-pulse' : status === 'Pending' ? 'bg-amber-400' : status === 'Rejected' ? 'bg-red-400' : 'bg-slate-400'}`}></span>
            {status}
        </span>
    );
}
