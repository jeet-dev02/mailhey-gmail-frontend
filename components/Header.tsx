"use client";

import { Search, Moon, Sun, X, Menu } from "lucide-react";
import { CopyAddressButton } from "./CopyAddressButton";

interface HeaderProps {
    currentUser: string;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    searchQuery: string;                   // NEW: Receives the search text
    setSearchQuery: (query: string) => void; // NEW: Updates the search text
    onOpenDrawer: () => void;              // NEW: Opens the mobile sidebar drawer
}

export function Header({ currentUser, isDarkMode, toggleDarkMode, searchQuery, setSearchQuery, onOpenDrawer }: HeaderProps) {
    const fullEmail = currentUser.includes("@") ? currentUser : `${currentUser}@mailhey.com`;

    return (
        // Two stacked rows below md (address row, then a full-width search), the
        // original single row from md up.
        <header className="flex w-full flex-col gap-2 px-2 py-2 md:h-16 md:flex-row md:items-center md:justify-between md:gap-0 md:px-4 md:py-2">

            <div className="flex min-w-0 items-center gap-1 md:order-2 md:gap-2 md:pl-4">
                {/* The sidebar's own hamburger is off-screen while it is a drawer */}
                <button
                    onClick={onOpenDrawer}
                    aria-label="Open menu"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-[#E0E2E6] dark:hover:bg-gray-700 md:hidden"
                >
                    <Menu size={22} className="text-[#444746] dark:text-gray-300" />
                </button>

                {/* Capped so a long address truncates instead of squeezing the icons out */}
                <div className="order-1 flex min-w-0 flex-1 items-center gap-1 md:order-2 md:ml-2 md:flex-none">
                    <span
                        title={fullEmail}
                        className="truncate text-sm text-[#1F1F1F] dark:text-gray-200 md:max-w-[240px]"
                    >
                        {fullEmail}
                    </span>
                    <CopyAddressButton address={fullEmail} />
                </div>

                <button
                    onClick={toggleDarkMode}
                    title="Toggle Dark Mode"
                    aria-label="Toggle Dark Mode"
                    className="order-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-[#E0E2E6] dark:hover:bg-gray-700 md:order-1 md:h-10 md:w-10"
                >
                    {isDarkMode ? (
                        <Sun size={24} className="text-gray-300" />
                    ) : (
                        <Moon size={24} className="text-[#444746]" />
                    )}
                </button>
            </div>

            <div className="w-full min-w-0 md:order-1 md:ml-2 md:max-w-3xl md:flex-1">
                <div className="flex items-center bg-[#EAF1FB] dark:bg-gray-700 px-3 py-2.5 rounded-full focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:shadow-md transition-all md:px-4">
                    <Search size={22} className="text-[#444746] dark:text-gray-300 mr-2 shrink-0 md:mr-3" />
                    {/* text-[16px] keeps iOS Safari from zooming the viewport on focus */}
                    <input
                        type="text"
                        placeholder={`Search in ${fullEmail}`}
                        value={searchQuery} // Binds the input to our state
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        maxLength={50}
                        className="min-w-0 flex-1 bg-transparent border-none outline-none text-[#1F1F1F] dark:text-white placeholder-[#444746] dark:placeholder-gray-400 text-[16px]"
                    />
                    {/* Shows an 'X' button only when there is text to clear */}
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} aria-label="Clear search" className="ml-2 shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                            <X size={20} className="text-[#444746] dark:text-gray-300" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
