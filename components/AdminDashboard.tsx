"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Loader2, ChevronRight, ShieldAlert } from "lucide-react";

interface AggregatedUser {
    username: string;
    emailCount: number;
}

interface AdminDashboardProps {
    onSelectUser: (username: string) => void;
}

export function AdminDashboard({ onSelectUser }: AdminDashboardProps) {
    const [users, setUsers] = useState<AggregatedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSystemEmails = async () => {
            try {
                // Pointing directly to your simulation backend on port 4000
                const res = await fetch('http://localhost:4000/api/getallemails');
                
                if (!res.ok) throw new Error("Backend connection failed.");
                
                const json = await res.json();

                if (json.status === "success") {
                    const sortedData = json.data.sort((a: AggregatedUser, b: AggregatedUser) => b.emailCount - a.emailCount);
                    setUsers(sortedData);
                } else {
                    setError("Failed to load system data.");
                }
            } catch (err) {
                console.error(err);
                setError("Network error: Could not connect to the simulation backend on port 4000.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSystemEmails();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors items-center justify-center text-[#444746] dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700">
                <Loader2 size={32} className="animate-spin mb-4 text-indigo-600 dark:text-indigo-400" />
                <p className="text-sm font-medium">Aggregating system emails...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors items-center justify-center p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <ShieldAlert size={48} className="text-red-500 mb-4 opacity-50" />
                <p className="text-[#1F1F1F] dark:text-gray-200 font-medium mb-2">{error}</p>
                <p className="text-sm text-[#444746] dark:text-gray-400 text-center max-w-md">
                    Please ensure your simulation backend is running via <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">npm run dev</code> on port 4000 and CORS is enabled.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors shadow-sm border border-gray-100 dark:border-gray-700">
            {/* Header matches EmailDetail style */}
            <div className="px-6 pt-6 lg:px-10 lg:pt-8 shrink-0 border-b border-gray-100 dark:border-gray-700 pb-6">
                <h2 className="text-2xl font-normal text-[#1F1F1F] dark:text-gray-100 mb-2 transition-colors flex items-center gap-3">
                    <Users className="text-indigo-600 dark:text-indigo-400" size={28} />
                    System Admin Dashboard
                </h2>
                <p className="text-sm text-[#444746] dark:text-gray-400">Global overview of all active simulation inboxes.</p>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto p-6 lg:px-10 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="grid gap-3">
                    {users.map((user) => (
                        <div 
                            key={user.username}
                            onClick={() => onSelectUser(user.username)}
                            className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#1E1E1E] hover:bg-indigo-50 dark:hover:bg-gray-700/80 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 mt-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg uppercase transition-colors shrink-0">
                                    {user.username.charAt(0)}
                                </div>
                                <span className="font-bold text-[#1F1F1F] dark:text-gray-200 text-sm transition-colors">
                                    {user.username}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-[#444746] dark:text-gray-400">
                                    <Mail size={14} />
                                    {user.emailCount} emails
                                </div>
                                <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                    
                    {users.length === 0 && (
                        <div className="text-center py-12 text-[#444746] dark:text-gray-500 text-sm">No emails found in the system.</div>
                    )}
                </div>
            </div>
        </div>
    );
}