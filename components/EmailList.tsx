"use client";

import { Email } from "@/lib/types";
import { EmailRow } from "./EmailRow";
import { RefreshCw, ChevronLeft, ChevronRight, Mail, Search, CheckSquare, Square, MinusSquare } from "lucide-react"; 

interface EmailListProps {
  emails: Email[];
  onEmailClick: (email: Email) => void;
  onToggleStar: (id: string) => void;
  onRefresh: () => void; 
  searchQuery?: string;
  selectedIds: string[];                 
  onToggleSelect: (id: string) => void;  
  onSelectAll: () => void;               
}

export function EmailList({ emails, onEmailClick, onToggleStar, onRefresh, searchQuery = "", selectedIds, onToggleSelect, onSelectAll }: EmailListProps) {
    
    const allSelected = emails.length > 0 && selectedIds.length === emails.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < emails.length;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                    <button className="p-1 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-sm transition-colors" title="Select" onClick={onSelectAll}>
                        {allSelected ? (
                            <CheckSquare size={20} className="text-[#0b57d0] dark:text-indigo-400 m-1" />
                        ) : someSelected ? (
                            <MinusSquare size={20} className="text-[#444746] dark:text-gray-300 m-1" />
                        ) : (
                            <Square size={20} className="text-[#444746] dark:text-gray-400 m-1" />
                        )}
                    </button>

                    <button className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors" title="Refresh" onClick={onRefresh}>
                        <RefreshCw size={18} className="text-[#444746] dark:text-gray-300" />
                    </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#444746] dark:text-gray-300">
                    <span>1-{emails.length === 0 ? 0 : emails.length} of {emails.length}</span>
                    <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full disabled:opacity-50 transition-colors"><ChevronLeft size={20} /></button>
                        <button className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full disabled:opacity-50 transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {emails.length === 0 ? (
                    searchQuery.trim() !== "" ? (
                        <div className="flex flex-col items-center justify-center h-64 text-[#444746] dark:text-gray-400">
                            <div className="bg-[#F6F8FC] dark:bg-gray-700 p-8 rounded-full mb-4 transition-colors">
                                <Search size={48} className="text-[#0b57d0] dark:text-indigo-400" />
                            </div>
                            <p className="text-xl font-medium dark:text-gray-200">No results found</p>
                            <p className="text-sm mt-2 text-center max-w-md">
                                No messages match your search for <span className="font-bold text-[#1F1F1F] dark:text-gray-200">"{searchQuery}"</span>
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-[#444746] dark:text-gray-400">
                            <div className="bg-[#F6F8FC] dark:bg-gray-700 p-8 rounded-full mb-4 transition-colors">
                                <Mail size={48} className="text-[#0b57d0] dark:text-indigo-400" />
                            </div>
                            <p className="text-xl font-medium dark:text-gray-200">Your inbox is empty</p>
                            <p className="text-sm mt-2">Messages you receive will appear here</p>
                        </div>
                    )
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
                        {emails.map((email) => (
                            <EmailRow 
                                key={email.id} 
                                email={email} 
                                onClick={onEmailClick} 
                                onToggleStar={onToggleStar} 
                                searchQuery={searchQuery}
                                selected={selectedIds.includes(email.id)} 
                                onToggleSelect={onToggleSelect}           
                            /> 
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}