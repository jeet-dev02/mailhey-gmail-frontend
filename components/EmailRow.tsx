"use client";

import { Star, Square, CheckSquare, Trash2, Mail } from "lucide-react"; 
import { Email } from "@/lib/types";

interface EmailRowProps {
    email: Email;
    selected: boolean; 
    onClick: (email: Email) => void;
    onToggleStar: (id: string) => void; 
    searchQuery?: string; 
    onToggleSelect: (id: string) => void; 
}

export function EmailRow({ email, selected, onClick, onToggleStar, searchQuery = "", onToggleSelect }: EmailRowProps) {
    
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
            onClick={() => onClick(email)}
            className={`group flex items-center gap-4 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 hover:shadow-md hover:z-10 relative cursor-pointer transition-all ${
                selected 
                ? 'bg-[#C2E7FF] dark:bg-indigo-900/40 hover:bg-[#b5e0fe] dark:hover:bg-indigo-900/60' 
                : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'
            }`}
        >
            <div className="flex items-center gap-3 text-[#444746] dark:text-gray-400" onClick={(e) => e.stopPropagation()}> 
                <button 
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm transition-colors"
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
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onToggleStar(email.id); 
                    }}
                >
                    <Star size={20} className={email.starred ? "fill-yellow-400 text-yellow-400" : ""} />
                </button>
            </div>

            <div className="flex-1 flex items-center min-w-0">
                <span className="w-48 font-medium truncate text-[#1F1F1F] dark:text-gray-200 group-hover:text-[#001D35] dark:group-hover:text-white transition-colors">
                    {highlightText(email.sender, searchQuery)}
                </span>

                <div className="flex-1 flex max-w-full truncate text-[#444746] dark:text-gray-400 text-sm">
                    <span className="font-medium text-[#1F1F1F] dark:text-gray-200 mr-1 transition-colors">
                        {highlightText(email.subject, searchQuery)}
                    </span>
                    <span className="mx-1 text-[#444746] dark:text-gray-500">-</span>
                    <span className="truncate">
                        {highlightText(email.body, searchQuery)}
                    </span>
                </div>

                {/* Hover Actions: Background matches the row's hover state perfectly */}
                <div className="hidden group-hover:flex items-center gap-2 pl-2 w-max bg-gray-50 dark:bg-gray-700 backdrop-blur-sm transition-colors" onClick={(e) => e.stopPropagation()}>
                    <button className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-600 rounded-full transition-colors" title="Delete">
                        <Trash2 size={18} className="text-[#444746] dark:text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-600 rounded-full transition-colors" title="Mark as unread">
                        <Mail size={18} className="text-[#444746] dark:text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
}