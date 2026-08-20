"use client";

import { Email } from "@/lib/types";
import { EmailRow } from "./EmailRow";
import { CopyAddressButton } from "./CopyAddressButton";
import { RefreshCw, ChevronLeft, ChevronRight, Mail, Search, CheckSquare, Square, MinusSquare, Star } from "lucide-react";

interface EmailListProps {
  emails: Email[];
  currentUser: string;
  currentView: string;
  onEmailClick: (email: Email) => void;
  onToggleStar: (id: string) => void;
  onRefresh: () => void;
  searchQuery?: string;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onToggleRead: (id: string) => void;
  onSetReadStatus: (ids: string[], read: boolean) => void;
}

export function EmailList({
    emails,
    currentUser,
    currentView,
    onEmailClick,
    onToggleStar,
    onRefresh,
    searchQuery = "",
    selectedIds,
    onToggleSelect,
    onSelectAll,
    currentPage,
    totalPages,
    onPageChange,
    onToggleRead,
    onSetReadStatus
}: EmailListProps) {

    const allSelected = emails.length > 0 && selectedIds.length === emails.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < emails.length;
    const hasSelection = selectedIds.length > 0;
    const isStarredView = currentView === "starred";

    // 44px touch targets on mobile, back to the compact toolbar buttons from sm up
    const iconButtonClass = "flex h-11 w-11 shrink-0 items-center justify-center transition-colors sm:h-10 sm:w-10";
    const actionButtonClass = "px-2 sm:px-3 py-1.5 rounded-full text-sm whitespace-nowrap text-[#444746] dark:text-gray-300 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 transition-colors";

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors">
            {/* Toolbar — wraps so the selection bar drops onto its own row on narrow screens */}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-1 py-1 sm:px-4 sm:py-2 border-b border-gray-100 dark:border-gray-700 transition-colors shrink-0">
                <div className="flex items-center gap-0 sm:gap-4">
                    <button
                        className={`${iconButtonClass} rounded-sm hover:bg-[#E0E2E6] dark:hover:bg-gray-700`}
                        title="Select"
                        aria-label="Select all messages"
                        onClick={onSelectAll}
                    >
                        {allSelected ? (
                            <CheckSquare size={20} className="text-[#0b57d0] dark:text-indigo-400" />
                        ) : someSelected ? (
                            <MinusSquare size={20} className="text-[#444746] dark:text-gray-300" />
                        ) : (
                            <Square size={20} className="text-[#444746] dark:text-gray-400" />
                        )}
                    </button>

                    <button
                        className={`${iconButtonClass} rounded-full hover:bg-[#E0E2E6] dark:hover:bg-gray-700`}
                        title="Refresh"
                        aria-label="Refresh"
                        onClick={onRefresh}
                    >
                        <RefreshCw size={18} className="text-[#444746] dark:text-gray-300" />
                    </button>
                </div>

                <div className="flex items-center gap-1 sm:gap-4 text-sm text-[#444746] dark:text-gray-300">
                    {/* Shortened to "1/1" below sm so it can never push the arrows off-screen */}
                    <span className="hidden sm:inline whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                    <span className="sm:hidden whitespace-nowrap text-xs" title={"Page " + currentPage + " of " + totalPages}>
                        {currentPage}/{totalPages}
                    </span>
                    <div className="flex items-center gap-0 sm:gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            aria-label="Previous page"
                            className={`${iconButtonClass} rounded-full hover:bg-[#E0E2E6] dark:hover:bg-gray-700 disabled:opacity-50`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            aria-label="Next page"
                            className={`${iconButtonClass} rounded-full hover:bg-[#E0E2E6] dark:hover:bg-gray-700 disabled:opacity-50`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {hasSelection && (
                    <div className="order-last flex w-full flex-wrap items-center gap-1 border-t border-gray-100 dark:border-gray-700 px-1 py-1 sm:order-none sm:w-auto sm:border-t-0 sm:border-l sm:border-gray-200 sm:dark:border-gray-600 sm:px-0 sm:py-0 sm:pl-4">
                        <span className="text-sm text-[#444746] dark:text-gray-300 whitespace-nowrap mr-1">
                            {selectedIds.length} selected
                        </span>
                        {/* Labels shorten below sm so all three controls fit on one 320px row */}
                        <button className={actionButtonClass} onClick={() => onSetReadStatus(selectedIds, true)}>
                            <span className="sm:hidden">Read</span>
                            <span className="hidden sm:inline">Mark as read</span>
                        </button>
                        <button className={actionButtonClass} onClick={() => onSetReadStatus(selectedIds, false)}>
                            <span className="sm:hidden">Unread</span>
                            <span className="hidden sm:inline">Mark as unread</span>
                        </button>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {emails.length === 0 ? (
                    searchQuery.trim() !== "" ? (
                        <div className="flex flex-col items-center justify-center h-64 text-[#444746] dark:text-gray-400 px-4">
                            <div className="bg-[#F6F8FC] dark:bg-gray-700 p-6 sm:p-8 rounded-full mb-4 transition-colors">
                                <Search size={48} className="text-[#0b57d0] dark:text-indigo-400" />
                            </div>
                            <p className="text-xl font-medium dark:text-gray-200">No results found</p>
                            <p className="text-sm mt-2 text-center max-w-md break-words">
                                No messages match your search for <span className="font-bold text-[#1F1F1F] dark:text-gray-200">"{searchQuery}"</span>
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-[#444746] dark:text-gray-400">
                            <div className="bg-[#F6F8FC] dark:bg-gray-700 p-6 sm:p-8 rounded-full mb-4 transition-colors">
                                {isStarredView ? (
                                    <Star size={48} className="text-[#0b57d0] dark:text-indigo-400" />
                                ) : (
                                    <Mail size={48} className="text-[#0b57d0] dark:text-indigo-400" />
                                )}
                            </div>
                            <p className="text-xl font-medium dark:text-gray-200 text-center px-4">
                                {isStarredView ? "No starred messages" : "No messages yet"}
                            </p>
                            <p className="text-sm mt-2 text-center max-w-md px-4">
                                {isStarredView
                                    ? "Messages you star will appear here."
                                    : "Send an email to this address and it will appear here."}
                            </p>
                            <div className="flex items-center gap-1 mt-3 max-w-full min-w-0 px-4">
                                <span className="truncate font-medium text-[#1F1F1F] dark:text-gray-200">{currentUser}</span>
                                <CopyAddressButton address={currentUser} />
                            </div>
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
                                onToggleRead={onToggleRead}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
