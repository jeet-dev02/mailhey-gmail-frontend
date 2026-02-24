"use client";

import { Inbox, Star, Trash2, Menu } from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    currentView: string;
    setCurrentView: (view: string) => void;
    onLogoClick?: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar, currentView, setCurrentView, onLogoClick }: SidebarProps) {
    
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