"use client";

import { Inbox, Star, Menu } from "lucide-react";
import { useEffect, useState } from "react";

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    isDrawerOpen: boolean;
    closeDrawer: () => void;
    currentView: string;
    setCurrentView: (view: string) => void;
    onLogoClick?: () => void;
}

// Matches the `md:` breakpoint the classes below switch on.
const DESKTOP_QUERY = "(min-width: 768px)";

export default function Sidebar({ isOpen, toggleSidebar, isDrawerOpen, closeDrawer, currentView, setCurrentView, onLogoClick }: SidebarProps) {
    const [switchInput, setSwitchInput] = useState("");

    useEffect(() => {
        if (!isDrawerOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeDrawer();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isDrawerOpen, closeDrawer]);

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

    // Below md this is a drawer, so the same button that collapses the desktop
    // rail has to close the drawer instead.
    const handleMenuClick = () => {
        if (typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches) {
            toggleSidebar();
        } else {
            closeDrawer();
        }
    };

    const handleNavClick = (view: string) => {
        setCurrentView(view);
        closeDrawer();
    };

    // The drawer is always the expanded layout — only the md+ rail collapses, so
    // "collapsed" chrome is hidden from md up rather than outright unmounted.
    const collapsedOnDesktop = isOpen ? "" : "md:hidden";
    
    const getNavClass = (viewName: string) => {
        const isActive = currentView === viewName;
        return `flex items-center justify-between px-6 py-2.5 md:py-1.5 rounded-r-full cursor-pointer transition-colors ${isOpen ? '' : 'md:justify-center md:px-0'} ${
            isActive 
            ? 'bg-[#D3E3FD] dark:bg-indigo-900 text-[#041E49] dark:text-indigo-100' 
            : 'text-[#444746] dark:text-gray-300 hover:bg-[#EAECEE] dark:hover:bg-gray-700'
        }`;
    };

    return (
        <>
            {/* Drawer scrim — mobile only, never rendered over the md+ rail */}
            <div
                onClick={closeDrawer}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
                    isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex h-full w-[256px] min-w-[256px] flex-col overflow-hidden bg-[#F6F8FC] py-2 pr-4 transition-transform duration-300 dark:bg-gray-900 md:static md:z-auto md:translate-x-0 md:bg-transparent md:transition-all md:dark:bg-transparent ${
                    isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
                } ${isOpen ? 'md:w-[256px] md:min-w-[256px] md:pr-4' : 'md:w-[72px] md:min-w-[72px] md:pr-2'}`}
            >
            
                <div className={`flex items-center h-16 mt-1 mb-2 pl-6 gap-4 ${isOpen ? '' : 'md:justify-center md:gap-0 md:pl-0'}`}>
                    <button
                        onClick={handleMenuClick}
                        aria-label="Toggle menu"
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-[#E0E2E6] dark:hover:bg-gray-700 -ml-3 ${isOpen ? '' : 'md:ml-0'}`}
                    >
                        <Menu size={20} className="text-[#444746] dark:text-gray-300" />
                    </button>
                    <div 
                        className={`text-[24px] font-bold tracking-tight text-indigo-600 select-none whitespace-nowrap cursor-pointer ${collapsedOnDesktop}`}
                        onClick={onLogoClick} 
                        title="Go to Login"
                    >
                        mail<span className="text-gray-600 dark:text-gray-300">hey</span>
                    </div>
                </div>

                {/* SIDEBAR INBOX SWITCHER */}
                <div className={`px-4 mb-4 mt-2 ${collapsedOnDesktop}`}>
                    <form onSubmit={handleSwitchAccount} className="relative">
                        {/* text-base (16px) keeps iOS Safari from zooming the viewport on focus */}
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
                            className="w-full px-3 py-2.5 pr-10 text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#1F1F1F] dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
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

                <nav className="flex flex-col gap-0.5 mt-2">
                    <div className={getNavClass('inbox')} onClick={() => handleNavClick('inbox')}>
                        <div className="flex items-center gap-4">
                            <Inbox size={20} className={currentView === 'inbox' ? "fill-current" : "min-w-[20px]"} />
                            <span className={`${collapsedOnDesktop} ${currentView === 'inbox' ? "font-semibold text-sm" : "font-medium text-sm"}`}>Inbox</span>
                        </div>
                    </div>

                    <div className={getNavClass('starred')} onClick={() => handleNavClick('starred')}>
                        <div className="flex items-center gap-4">
                            <Star size={20} className="min-w-[20px]" />
                            <span className={`${collapsedOnDesktop} ${currentView === 'starred' ? "font-semibold text-sm" : "font-medium text-sm"}`}>Starred</span>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
}
