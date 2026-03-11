"use client";

import { Inbox, Star, Trash2, Menu } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    currentView: string;
    setCurrentView: (view: string) => void;
    onLogoClick?: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar, currentView, setCurrentView, onLogoClick }: SidebarProps) {
    const [switchInput, setSwitchInput] = useState("");

    const handleSwitchAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!switchInput) return;
        
        let cleanUsername = switchInput.split('@')[0];
        cleanUsername = cleanUsername.replace(/\.[a-z]{2,4}$/i, "");
        
        // 1. Allow both letters and numbers
        cleanUsername = cleanUsername.replace(/[^a-z0-9]/g, "");
        // 2. Final safety net: ensure it does not start with a number
        cleanUsername = cleanUsername.replace(/^[0-9]+/, "");

        if (cleanUsername) {
            window.location.replace(`/${cleanUsername}@mailhey.com/inbox`);
        }
    };
    
    const getNavClass = (viewName: string) => {
        const isActive = currentView === viewName;
        return `flex items-center ${isOpen ? 'justify-between px-6' : 'justify-center'} py-1.5 rounded-r-full cursor-pointer transition-colors ${
            isActive 
            ? 'bg-[#D3E3FD] dark:bg-indigo-900 text-[#041E49] dark:text-indigo-100' 
            : 'text-[#444746] dark:text-gray-300 hover:bg-[#EAECEE] dark:hover:bg-gray-700'
        }`;
    };

    return (
        <aside className={`${isOpen ? 'w-[256px] min-w-[256px] pr-4' : 'w-[72px] min-w-[72px] pr-2'} py-2 flex flex-col bg-transparent h-full transition-all duration-300 overflow-hidden`}>
            
            <div className={`flex items-center h-16 mt-1 mb-2 ${isOpen ? 'pl-6 gap-4' : 'justify-center'}`}>
                <button onClick={toggleSidebar} className={`p-3 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full ${isOpen ? '-ml-3' : ''}`}>
                    <Menu size={20} className="text-[#444746] dark:text-gray-300" />
                </button>
                {isOpen && (
                    <div 
                        className="text-[24px] font-bold tracking-tight text-indigo-600 select-none whitespace-nowrap cursor-pointer" 
                        onClick={onLogoClick} 
                        title="Go to Login"
                    >
                        mail<span className="text-gray-600 dark:text-gray-300">hey</span>
                    </div>
                )}
            </div>

            {/* SIDEBAR INBOX SWITCHER */}
            {isOpen && (
                <div className="px-4 mb-4 mt-2">
                    <form onSubmit={handleSwitchAccount} className="relative">
                        <input 
                            type="text" 
                            placeholder="switch inbox"
                            maxLength={50}
                            value={switchInput}
                            onChange={(e) => {
                                const sanitizedValue = e.target.value
                                    .toLowerCase()
                                    .replace(/\s+/g, '')
                                    // 1. Allow letters, numbers, @, and .
                                    .replace(/[^a-z0-9@.]/g, '')
                                    // 2. Strip numbers if they are at the very beginning
                                    .replace(/^[0-9]+/, '');
                                
                                setSwitchInput(sanitizedValue);
                            }}
                            className="w-full px-3 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#1F1F1F] dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                        />
                        <button 
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 px-2 py-1 transition-colors"
                            title="Go to inbox"
                        >
                            GO
                        </button>
                    </form>
                </div>
            )}

            <nav className="flex flex-col gap-0.5 mt-2">
                <div className={getNavClass('inbox')} onClick={() => setCurrentView('inbox')}>
                    <div className="flex items-center gap-4">
                        <Inbox size={20} className={currentView === 'inbox' ? "fill-current" : "min-w-[20px]"} />
                        {isOpen && <span className={currentView === 'inbox' ? "font-semibold text-sm" : "font-medium text-sm"}>Inbox</span>}
                    </div>
                </div>

                <div className={getNavClass('starred')} onClick={() => setCurrentView('starred')}>
                    <div className="flex items-center gap-4">
                        <Star size={20} className="min-w-[20px]" />
                        {isOpen && <span className={currentView === 'starred' ? "font-semibold text-sm" : "font-medium text-sm"}>Starred</span>}
                    </div>
                </div>

                <div className={getNavClass('trash')} onClick={() => setCurrentView('trash')}>
                    <div className="flex items-center gap-4">
                        <Trash2 size={20} className="min-w-[20px]" />
                        {isOpen && <span className={currentView === 'trash' ? "font-semibold text-sm" : "font-medium text-sm"}>Trash</span>}
                    </div>
                </div>
            </nav>
        </aside>
    );
}