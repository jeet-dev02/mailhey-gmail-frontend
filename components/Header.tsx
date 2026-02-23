"use client";

import { Search, HelpCircle, Moon, Sun, X } from "lucide-react";

interface HeaderProps {
    currentUser: string;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    searchQuery: string;                   // NEW: Receives the search text
    setSearchQuery: (query: string) => void; // NEW: Updates the search text
}

export function Header({ currentUser, isDarkMode, toggleDarkMode, searchQuery, setSearchQuery }: HeaderProps) {
    const fullEmail = currentUser.includes("@") ? currentUser : `${currentUser}@mailhey.com`;

    return (
        <header className="flex items-center justify-between px-4 py-2 bg-transparent h-16 w-full">
            
            <div className="flex-1 max-w-3xl ml-2">
                <div className="flex items-center bg-[#EAF1FB] dark:bg-gray-700 px-4 py-2.5 rounded-full focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:shadow-md transition-all">
                    <Search size={22} className="text-[#444746] dark:text-gray-300 mr-3" />
                    <input
                        type="text"
                        placeholder={`Search in ${fullEmail}`}
                        value={searchQuery} // Binds the input to our state
                        onChange={(e) => setSearchQuery(e.target.value)} // Updates state as you type
                        className="flex-1 bg-transparent border-none outline-none text-[#1F1F1F] dark:text-white placeholder-[#444746] dark:placeholder-gray-400 text-[16px]"
                    />
                    {/* Shows an 'X' button only when there is text to clear */}
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full ml-2">
                            <X size={20} className="text-[#444746] dark:text-gray-300" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 pl-4 w-max justify-end">
                <button className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full">
                    <HelpCircle size={24} className="text-[#444746] dark:text-gray-300" />
                </button>
                
                <button 
                    onClick={toggleDarkMode}
                    title="Toggle Dark Mode"
                    className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full"
                >
                    {isDarkMode ? (
                        <Sun size={24} className="text-gray-300" />
                    ) : (
                        <Moon size={24} className="text-[#444746]" /> 
                    )}
                </button>
                
                <div className="ml-2">
                    <div 
                        title={fullEmail}
                        className="h-8 w-8 rounded-full bg-[#005c4b] text-white flex items-center justify-center text-sm font-medium cursor-default uppercase"
                    >
                        {currentUser ? currentUser.charAt(0) : "U"}
                    </div>
                </div>
            </div>
        </header>
    );
}