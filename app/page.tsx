"use client";

import { useEffect, useState } from "react";
import { fetchEmails } from "@/lib/api";
import { Email } from "@/lib/types";
import Sidebar from "@/components/Sidebar"; 
import { Header } from "@/components/Header";
import { EmailList } from "@/components/EmailList"; 
import { EmailDetail } from "@/components/EmailDetail";

export default function Home() {
  // --- STATES ---
  const [currentUser, setCurrentUser] = useState<string>(""); 
  const [tempInput, setTempInput] = useState("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false); 
  const [currentView, setCurrentView] = useState("inbox"); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // Selection State

  // --- EFFECTS ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const fetchInbox = async () => {
    setLoading(true);
    setError(null);
    try {
      const emailToFetch = currentUser.includes("@") ? currentUser : `${currentUser}@mailhey.com`;
      const data = await fetchEmails(emailToFetch, 1);
      setEmails(data);
    } catch (err) {
      console.error(err);
      setError("Server is waking up. Please click Retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchInbox();
  }, [currentUser]);

  // --- HANDLERS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempInput.trim()) {
      setCurrentUser(tempInput.trim());
    }
  };

  const handleToggleStar = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
    if (selectedEmail?.id === id) {
        setSelectedEmail(prev => prev ? { ...prev, starred: !prev.starred } : null);
    }
  };

  const handleEmailClick = (email: Email) => {
    setIsEmailLoading(true);
    setSelectedEmail(email);
    setTimeout(() => {
        setIsEmailLoading(false);
    }, 500); // 500ms delay to show the skeleton loader
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === displayedEmails.length && displayedEmails.length > 0) {
        setSelectedIds([]); // Deselect all
    } else {
        setSelectedIds(displayedEmails.map(email => email.id)); // Select all displayed
    }
  };

  // --- FILTERING LOGIC ---
  const displayedEmails = emails.filter(email => {
    // 1. Check Folder View
    if (currentView === "starred" && !email.starred) return false;
    if (currentView === "trash") return false; 

    // 2. Check Search Query (Supercharged and crash-proof)
    if (searchQuery.trim() !== "") {
        const query = searchQuery.trim().toLowerCase();
        const matchesSubject = (email.subject || "").toLowerCase().includes(query);
        const matchesSender = (email.sender || "").toLowerCase().includes(query);
        const matchesBody = (email.body || "").toLowerCase().includes(query);
        
        if (!matchesSubject && !matchesSender && !matchesBody) return false;
    }

    return true; 
  });

  const maxChars = 50;
  const remainingChars = maxChars - tempInput.length;

  // --- SIGN IN SCREEN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="text-[33px] font-bold tracking-tight text-indigo-600">
              mail<span className="text-gray-900 dark:text-white">hey</span>
            </div>
          </div>
          <h1 className="text-xl text-center font-medium text-gray-900 dark:text-white mb-2">Sign in</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-sm">to continue</p>

          <form onSubmit={handleLogin} className="space-y-1">
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 rounded border border-gray-300 dark:border-gray-600 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition text-gray-900 dark:text-white dark:bg-gray-700 font-medium placeholder-gray-500"
                placeholder="Email or phone"
                value={tempInput}
                maxLength={maxChars}
                onChange={(e) => setTempInput(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-between items-start mt-1">
                <span></span> 
                <span className="text-xs text-gray-400">
                    {remainingChars} characters remaining
                </span>
            </div>
            <div className="flex justify-end items-center mt-6 pt-4">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700 transition">
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN APP UI ---
  return (
    <div className="flex h-screen bg-[#F6F8FC] dark:bg-gray-900 transition-colors">
      <Sidebar 
         isOpen={isSidebarOpen} 
         toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
         currentView={currentView}
         setCurrentView={(view) => {
             setCurrentView(view);
             setSelectedEmail(null); 
             setSelectedIds([]); // Clear selections when changing folders
         }}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          currentUser={currentUser} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
          searchQuery={searchQuery}          
          setSearchQuery={setSearchQuery}    
        />
        <main className="flex-1 overflow-y-auto rounded-tl-2xl bg-white dark:bg-gray-800 shadow-sm mt-2 mr-2 mb-2 transition-colors">
           {loading ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                <p>Loading inbox...</p>
             </div>
           ) : error ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="mb-4 text-red-500">{error}</p>
                <button onClick={fetchInbox} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  Retry
                </button>
             </div>
           ) : selectedEmail ? (
             <EmailDetail 
                email={selectedEmail} 
                onBack={() => setSelectedEmail(null)} 
                onToggleStar={handleToggleStar} 
                isLoading={isEmailLoading}
             />
           ) : (
             <EmailList 
                emails={displayedEmails} 
                onEmailClick={handleEmailClick} 
                onToggleStar={handleToggleStar}
                onRefresh={fetchInbox} 
                searchQuery={searchQuery}
                selectedIds={selectedIds}          
                onToggleSelect={handleToggleSelect} 
                onSelectAll={handleSelectAll}      
             />
           )}
        </main>
      </div>
    </div>
  );
}