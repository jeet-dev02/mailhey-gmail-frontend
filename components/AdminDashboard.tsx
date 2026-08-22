"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldAlert, Loader2, Shield, Mail, RefreshCw, User, Lock } from "lucide-react";
import { fetchAllSystemEmails } from "@/lib/api";
import { Email } from "@/lib/types";

interface AdminDashboardProps {
    onSelectEmail: (username: string, emailId: string) => void;
}

export function AdminDashboard({ onSelectEmail }: AdminDashboardProps) {
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState("");
    
    // Security State
    const [isLocked, setIsLocked] = useState(true);
    const [tokenInput, setTokenInput] = useState("");
    const [lockError, setLockError] = useState("");

    const loadSystemEmails = useCallback(async (token: string, showRefreshIndicator = false) => {
        if (showRefreshIndicator) setIsRefreshing(true);
        else setIsLoading(true);
        
        setError("");
        setLockError("");
        
        try {
            const json = await fetchAllSystemEmails(token);
            if (json && json.status === "success") {
                setEmails(json.data);
                setIsLocked(false);
                sessionStorage.setItem('adminToken', token);
            } else {
                setError("Failed to load system data from the live database.");
            }
        } catch (err: any) {
            console.error(err);
            if (err.message === '401') {
                setLockError("Token rejected. Unauthorized.");
                sessionStorage.removeItem('adminToken');
                setIsLocked(true);
            } else {
                setError("Network error: Could not connect to the backend.");
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const savedToken = sessionStorage.getItem('adminToken');
        if (savedToken) {
            loadSystemEmails(savedToken);
        } else {
            setIsLoading(false); 
        }
    }, [loadSystemEmails]);

    const handleLock = () => {
        sessionStorage.removeItem('adminToken');
        setTokenInput('');
        setEmails([]);
        setIsLocked(true);
    };

    const formatShortDate = (dateString?: string) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return ""; }
    };

    if (isLocked) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors items-center justify-center p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <Shield size={56} className="text-indigo-600 dark:text-indigo-400 mb-6" />
                <h2 className="text-2xl font-bold text-[#1F1F1F] dark:text-gray-100 mb-2">Admin Access Required</h2>
                <p className="text-[#444746] dark:text-gray-400 mb-8 text-center max-w-sm">
                    Please enter your master token to view the global email stream.
                </p>
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (tokenInput.trim()) loadSystemEmails(tokenInput.trim());
                    }} 
                    className="flex flex-col gap-4 w-full max-w-xs"
                >
                    <input
                        type="password"
                        placeholder="Enter Admin Token"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Unlock Dashboard"}
                    </button>
                </form>
                {lockError && <p className="text-red-500 mt-4 text-sm font-medium">{lockError}</p>}
            </div>
        );
    }

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
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            const token = sessionStorage.getItem('adminToken');
                            if (token) loadSystemEmails(token);
                        }} 
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium"
                    >
                        Retry Connection
                    </button>
                    <button 
                        onClick={handleLock}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors text-sm font-medium"
                    >
                        Back to Lock Screen
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="px-6 pt-6 lg:px-10 lg:pt-8 shrink-0 border-b border-gray-100 dark:border-gray-700 pb-6 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-normal text-[#1F1F1F] dark:text-gray-100 mb-2 transition-colors flex items-center gap-3">
                        <Shield className="text-indigo-600 dark:text-indigo-400" size={28} />
                        Live Global Stream
                    </h2>
                    <p className="text-sm text-[#444746] dark:text-gray-400">Viewing all active emails across the EC2 server.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleLock}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-md transition-colors text-sm font-medium"
                    >
                        <Lock size={16} />
                        Lock
                    </button>
                    <button 
                        onClick={() => {
                            const token = sessionStorage.getItem('adminToken');
                            if (token) loadSystemEmails(token, true);
                        }}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                        {isRefreshing ? "Refreshing..." : "Refresh Stream"}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex flex-col">
                    {emails.map((email) => (
                        <div 
                            key={email.id}
                            onClick={() => {
                                // Safely route based on recipient fallback
                                const routeUsername = email.recipient ? email.recipient.split('@')[0] : 'unknown';
                                onSelectEmail(routeUsername, email.id);
                            }}
                            className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700/80 cursor-pointer transition-colors group"
                        >
                            <div className="w-48 font-bold text-[#1F1F1F] dark:text-gray-200 text-sm truncate shrink-0 flex items-center gap-2">
                                <User size={14} className="text-gray-400" />
                                {/* Safely split the recipient string */}
                                {email.recipient ? email.recipient.split('@')[0] : 'Unknown'}
                            </div>

                            <div className="flex-1 flex items-center min-w-0 text-sm">
                                <span className="font-semibold text-[#1F1F1F] dark:text-gray-200 truncate mr-2">
                                    {email.subject || '(No Subject)'}
                                </span>
                                <span className="text-[#444746] dark:text-gray-500 truncate">
                                    {/* Safely check for body before parsing */}
                                    {email.body ? `- ${email.body.replace(/<[^>]*>?/gm, '')}` : ''}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold shrink-0 max-w-[200px] truncate" title={email.sender}>
                                <Mail size={12} className="shrink-0" />
                                <span className="truncate">{email.sender ? email.sender.replace(/<[^>]+>/g, '').trim() : 'Unknown'}</span>
                            </div>

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