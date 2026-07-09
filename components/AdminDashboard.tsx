"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldAlert, Loader2, Shield, Mail, RefreshCw, User } from "lucide-react";
import { fetchAllSystemEmails } from "@/lib/api";
import { Email } from "@/lib/types";

interface SystemEmail extends Email {
    username: string;
}

interface AdminDashboardProps {
    onSelectEmail: (username: string, emailId: string) => void;
}

export function AdminDashboard({ onSelectEmail }: AdminDashboardProps) {
    const [emails, setEmails] = useState<SystemEmail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadSystemEmails = useCallback(async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setIsRefreshing(true);
        else setIsLoading(true);
        
        setError("");
        
        try {
            const json = await fetchAllSystemEmails();
            if (json && json.status === "success") {
                setEmails(json.data);
            } else {
                setError("Failed to load system data from the live database.");
            }
        } catch (err) {
            console.error(err);
            setError("Network error: Could not connect to the live Render/EC2 backend.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadSystemEmails();
    }, [loadSystemEmails]);

    const formatShortDate = (dateString?: string) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return ""; }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors items-center justify-center text-[#444746] dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700">
                <Loader2 size={32} className="animate-spin mb-4 text-indigo-600 dark:text-indigo-400" />
                <p className="text-sm font-medium">Loading live global email stream...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors items-center justify-center p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <ShieldAlert size={48} className="text-red-500 mb-4 opacity-50" />
                <p className="text-[#1F1F1F] dark:text-gray-200 font-medium mb-4">{error}</p>
                <button 
                    onClick={() => loadSystemEmails()} 
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors shadow-sm border border-gray-100 dark:border-gray-700">
            {/* Header */}
            <div className="px-6 pt-6 lg:px-10 lg:pt-8 shrink-0 border-b border-gray-100 dark:border-gray-700 pb-6 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-normal text-[#1F1F1F] dark:text-gray-100 mb-2 transition-colors flex items-center gap-3">
                        <Shield className="text-indigo-600 dark:text-indigo-400" size={28} />
                        Live Global Stream
                    </h2>
                    <p className="text-sm text-[#444746] dark:text-gray-400">Viewing all active emails across the EC2 server.</p>
                </div>
                
                <button 
                    onClick={() => loadSystemEmails(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
                >
                    <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                    {isRefreshing ? "Refreshing..." : "Refresh Stream"}
                </button>
            </div>

            {/* Flat Email List */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex flex-col">
                    {emails.map((email) => (
                        <div 
                            key={email.id}
                            // Clicking this routes you perfectly into that user's specific inbox
                            onClick={() => onSelectEmail(email.username, email.id)}
                            className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700/80 cursor-pointer transition-colors group"
                        >
                            {/* 1. INBOX OWNER (Target User) - Now prominent on the left */}
                            <div className="w-48 font-bold text-[#1F1F1F] dark:text-gray-200 text-sm truncate shrink-0 flex items-center gap-2">
                                <User size={14} className="text-gray-400" />
                                {email.username.split('@')[0]}
                            </div>

                            {/* 2. SUBJECT & BODY PREVIEW */}
                            <div className="flex-1 flex items-center min-w-0 text-sm">
                                <span className="font-semibold text-[#1F1F1F] dark:text-gray-200 truncate mr-2">
                                    {email.subject}
                                </span>
                                <span className="text-[#444746] dark:text-gray-500 truncate">
                                    - {email.body.replace(/<[^>]*>?/gm, '')}
                                </span>
                            </div>

                            {/* 3. SENDER BADGE - Now on the right in the colored pill */}
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold shrink-0 max-w-[200px] truncate" title={email.sender}>
                                <Mail size={12} className="shrink-0" />
                                <span className="truncate">{email.sender.replace(/<[^>]+>/g, '').trim()}</span>
                            </div>

                            {/* 4. DATE */}
                            <div className="w-24 text-right text-xs text-[#444746] dark:text-gray-400 font-medium shrink-0">
                                {formatShortDate(email.createdAt || email.created_at)}
                            </div>
                        </div>
                    ))}
                    
                    {emails.length === 0 && !isLoading && (
                        <div className="text-center py-12 text-[#444746] dark:text-gray-500 text-sm">No emails found in the live database.</div>
                    )}
                </div>
            </div>
        </div>
    );
}