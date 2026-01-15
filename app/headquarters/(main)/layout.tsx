import HQSidebar from "@/components/headquarters/HQSidebar";
import HQAuthProvider from "@/components/headquarters/HQAuthProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <HQAuthProvider>
            <div className="flex min-h-screen bg-[#0f1115] text-white">
                <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>
                <HQSidebar />
                <main className="flex-1 ml-72 p-8 overflow-y-auto h-screen relative z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto space-y-10">
                        {children}
                    </div>
                </main>
            </div>
        </HQAuthProvider>
    );
}
