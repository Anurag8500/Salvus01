"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HQAuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem("salvus_hq_session");
        if (!session) {
            router.replace("/headquarters/login");
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
        // Or return null to avoid flash, but a spinner/skeleton is nicer.
    }

    return <>{children}</>;
}
