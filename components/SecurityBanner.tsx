"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { SecurityAssessment } from "@/lib/security";

interface SecurityBannerProps {
    assessment: SecurityAssessment;
}

export function SecurityBanner({ assessment }: SecurityBannerProps) {
    // If the email is perfectly safe, this component renders nothing.
    if (assessment.status === "Safe") return null;

    const isCritical = assessment.status === "Critical Risk";

    return (
        <div className={`mx-6 mt-4 p-4 rounded-xl border flex gap-3 shadow-sm transition-all ${
            isCritical 
            ? "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-200" 
            : "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-200"
        }`}>
            <div className="mt-0.5 flex-shrink-0">
                {isCritical 
                    ? <ShieldAlert size={22} className="text-red-600 dark:text-red-500" /> 
                    : <AlertTriangle size={22} className="text-amber-600 dark:text-amber-500" />
                }
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-bold mb-1.5 tracking-tight uppercase">
                    Security Warning: {assessment.status}
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside opacity-90">
                    {assessment.flags.map((flag, idx) => (
                        <li key={idx} className="leading-relaxed">{flag}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}