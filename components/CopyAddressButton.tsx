"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyAddressButtonProps {
    address: string;
}

export function CopyAddressButton({ address }: CopyAddressButtonProps) {
    const [copied, setCopied] = useState(false);
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (resetTimer.current) clearTimeout(resetTimer.current);
        };
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(address);
        } catch {
            // Clipboard is unavailable on insecure origins — stay silent rather than
            // confirming a copy that never happened.
            return;
        }

        setCopied(true);
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied" : `Copy ${address}`}
            aria-label={copied ? "Copied" : `Copy ${address}`}
            className="relative shrink-0 p-1.5 rounded-full hover:bg-[#E0E2E6] dark:hover:bg-gray-700 transition-colors"
        >
            {copied ? (
                <Check size={16} className="text-green-600 dark:text-green-400" />
            ) : (
                <Copy size={16} className="text-[#444746] dark:text-gray-300" />
            )}

            {copied && (
                <span
                    role="status"
                    className="absolute top-full right-0 z-10 mt-1 px-2 py-0.5 rounded bg-[#1F1F1F] text-white dark:bg-gray-100 dark:text-[#1F1F1F] text-xs whitespace-nowrap"
                >
                    Copied
                </span>
            )}
        </button>
    );
}
