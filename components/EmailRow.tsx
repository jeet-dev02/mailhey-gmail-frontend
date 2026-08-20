"use client";

import { Star, Square, CheckSquare, Mail, MailOpen } from "lucide-react"; 
import { Email } from "@/lib/types";

interface EmailRowProps {
    email: Email;
    selected: boolean; 
    onClick: (email: Email) => void;
    onToggleStar: (id: string) => void; 
    searchQuery?: string; 
    onToggleSelect: (id: string) => void; 
    onToggleRead: (id: string) => void; 
}

// 44px minimum touch target on mobile, back to the compact icon button from sm up.
const touchTargetClass = "flex h-11 w-11 shrink-0 items-center justify-center transition-colors sm:h-8 sm:w-8";

export function EmailRow({ email, selected, onClick, onToggleStar, searchQuery = "", onToggleSelect, onToggleRead }: EmailRowProps) {
    
    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim() || !text) return text;
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) => 
            regex.test(part) ? (
                <span key={i} className="bg-yellow-200 text-black dark:bg-yellow-500/30 dark:text-yellow-200 px-0.5 rounded-sm">
                    {part}
                </span>
            ) : part
        );
    };

    return (
        <div 
            onClick={() => {
                if (!email.read) {
                    onToggleRead(email.id);
                }
                onClick(email);
            }}
            className={`group flex items-center gap-1 px-1 py-1.5 sm:gap-4 sm:px-4 sm:py-2.5 border-b border-gray-100 dark:border-gray-700 hover:shadow-md hover:z-10 relative cursor-pointer transition-all ${
                selected 
                ? 'bg-[#C2E7FF] dark:bg-indigo-900/40 hover:bg-[#b5e0fe] dark:hover:bg-indigo-900/60' 
                : email.read 
                    ? 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800' 
                    : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
            }`}
        >
            <div className="flex shrink-0 items-center gap-0 text-[#444746] dark:text-gray-400 sm:gap-3" onClick={(e) => e.stopPropagation()}> 
                <button 
                    aria-label={selected ? "Deselect message" : "Select message"}
                    className={`${touchTargetClass} rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600`}
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onToggleSelect(email.id);
                    }}
                >
                    {selected ? (
                        <CheckSquare size={20} className="text-[#0b57d0] dark:text-indigo-400" />
                    ) : (
                        <Square size={20} />
                    )}
                </button>

                <button 
                    aria-label={email.starred ? "Unstar message" : "Star message"}
                    className={`${touchTargetClass} rounded-full hover:bg-gray-200 dark:hover:bg-gray-600`}
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onToggleStar(email.id); 
                    }}
                >
                    <Star size={20} className={email.starred ? "fill-yellow-400 text-yellow-400" : ""} />
                </button>
            </div>

            {/* Stacked sender/subject below sm — one line will not fit at 320px */}
            <div className="flex-1 flex flex-col min-w-0 sm:flex-row sm:items-center">
                <span className={`w-full truncate text-[#1F1F1F] dark:text-gray-200 group-hover:text-[#001D35] dark:group-hover:text-white transition-colors sm:w-48 sm:shrink-0 ${email.read ? 'font-normal' : 'font-bold'}`}>
                    {highlightText(email.sender, searchQuery)}
                </span>

                <div className="flex w-full min-w-0 sm:flex-1 sm:max-w-full sm:truncate text-[#444746] dark:text-gray-400 text-sm">
                    <span className={`truncate text-[#1F1F1F] dark:text-gray-200 mr-1 transition-colors ${email.read ? 'font-normal' : 'font-bold'}`}>
                        {highlightText(email.subject, searchQuery)}
                    </span>
                    <span className="mx-1 hidden text-[#444746] dark:text-gray-500 sm:inline">-</span>
                    <span className="hidden truncate sm:inline">
                        {highlightText(email.body, searchQuery)}
                    </span>
                </div>

                <div className="hidden sm:group-hover:flex items-center gap-2 pl-2 w-max bg-gray-50 dark:bg-gray-700 backdrop-blur-sm transition-colors" onClick={(e) => e.stopPropagation()}>
                    <button
                        className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-600 rounded-full transition-colors" 
                        title={email.read ? "Mark as unread" : "Mark as read"}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleRead(email.id);
                        }}
                    >
                        {email.read ? <Mail size={18} className="text-[#444746] dark:text-gray-300" /> : <MailOpen size={18} className="text-[#444746] dark:text-gray-300" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
