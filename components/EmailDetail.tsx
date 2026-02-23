"use client";

import { ArrowLeft, Trash2, Star } from "lucide-react";
import { Email } from "@/lib/types";

interface EmailDetailProps {
    email: Email;
    onBack: () => void;
    onToggleStar: (id: string) => void;
    isLoading?: boolean; 
}

export function EmailDetail({ email, onBack, onToggleStar, isLoading }: EmailDetailProps) {
    
    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors">
                <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <button onClick={onBack} className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors" title="Back to Inbox">
                        <ArrowLeft size={20} className="text-[#444746] dark:text-gray-300" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:px-10 lg:py-8">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-8 animate-pulse"></div>
                    
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                        <div className="flex flex-col gap-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-full animate-pulse pt-4"></div>
                        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-4/6 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors">
            <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 dark:border-gray-700 transition-colors">
                <button onClick={onBack} className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors" title="Back to Inbox">
                    <ArrowLeft size={20} className="text-[#444746] dark:text-gray-300" />
                </button>
                <button onClick={() => onToggleStar(email.id)} className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors" title="Star">
                    <Star size={20} className={email.starred ? "fill-yellow-400 text-yellow-400" : "text-[#444746] dark:text-gray-300"} />
                </button>
                <button className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors" title="Delete">
                    <Trash2 size={20} className="text-[#444746] dark:text-gray-300" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:px-10 lg:py-8">
                <h2 className="text-2xl font-normal text-[#1F1F1F] dark:text-gray-100 mb-8 transition-colors">{email.subject}</h2>
                
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg uppercase transition-colors">
                        {email.sender.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1F1F1F] dark:text-gray-200 text-sm transition-colors">{email.sender}</span>
                        </div>
                        <span className="text-xs text-[#444746] dark:text-gray-400 transition-colors">to me</span>
                    </div>
                </div>

                <div className="text-[#1F1F1F] dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed transition-colors">
                    {email.body}
                </div>
            </div>
        </div>
    );
}