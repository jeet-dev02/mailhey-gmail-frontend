"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchEmails, fetchEmailDetail } from "@/lib/api";
import { Email } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import { Header } from "@/components/Header";
import {EmailList} from "@/components/EmailList";
import { EmailDetail } from "@/components/EmailDetail";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Shield } from "lucide-react";

const getStarOverrides = () => {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("mailhey_star_overrides") || "{}");
  }
  return {};
};

export default function Home() {
  const params = useParams();
  const router = useRouter();

  const slug = (params?.slug as string[]) || [];
  
  let initialUser = "";
  let initialAdminState = false; 

  if (slug[0]) {
      const rawSlug = decodeURIComponent(slug[0]).toLowerCase();
      
      if (rawSlug === 'admin') {
          initialAdminState = true;
      } 
      else if (rawSlug.includes('@')) {
          if (rawSlug.endsWith('@mailhey.com')) {
              initialUser = rawSlug;
          }
      } 
      else {
          let cleanUsername = rawSlug.replace(/\.[a-z]{2,4}$/i, "");
          cleanUsername = cleanUsername.replace(/[^a-z0-9]/g, "");
          
          if (cleanUsername) {
              initialUser = `${cleanUsername}@mailhey.com`;
          }
      }
  }

  const initialFolder = slug[1] || "inbox";
  const initialEmailId = slug[2] || null;

  // --- STATE DECLARATIONS ---
  const [currentUser, setCurrentUser] = useState<string>(initialUser);
  const [currentView, setCurrentView] = useState(initialFolder);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(initialUser !== "");
  const [error, setError] = useState<string | null>(null);
  const [tempInput, setTempInput] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingDeepLink, setPendingDeepLink] = useState<string | null>(
    initialEmailId,
  );
  const [showAdminPanel, setShowAdminPanel] = useState(initialAdminState); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  //  Added (pageToFetch: number = currentPage) to resolve TypeScript error
  const fetchInbox = async (pageToFetch: number = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      //  Passed pageToFetch to the API call
      const data = await fetchEmails(currentUser, pageToFetch);
      const overrides = getStarOverrides();

      const mergedData = data.emails.map((email: Email) => {
        if (overrides[email.id] !== undefined) {
          return { ...email, starred: overrides[email.id] };
        }
        return email;
      });

      setEmails(mergedData);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      
      if (pendingDeepLink) {
        const found = mergedData.find((e: Email) => e.id === pendingDeepLink);
        if (found) {
          setSelectedEmail(found);
          const username = currentUser.split('@')[0];
          fetchEmailDetail(found.id, username).then(fullDetails => {
              if (fullDetails) setSelectedEmail(prev => prev ? { ...prev, ...fullDetails } : null);
          });
        }
        setPendingDeepLink(null);
      }
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
  
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      
      if (currentUser) {
          setCurrentUser("");
          setCurrentView("inbox");
          setSelectedEmail(null);
          setTempInput(""); 
          setShowAdminPanel(path === '/admin');
      } else {
          setShowAdminPanel(path === '/admin');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentUser) {
        const cleanPath = selectedEmail 
            ? `/${currentUser}/${currentView}/${selectedEmail.id}`
            : `/${currentUser}/${currentView}`;
            
        if (decodeURIComponent(window.location.pathname) !== cleanPath) {
            window.history.replaceState(null, '', cleanPath);
        }
      } else if (showAdminPanel) {
        if (window.location.pathname !== '/admin') {
            window.history.replaceState(null, '', '/admin');
        }
      } else if (window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/');
      }
    }
  }, [currentUser, currentView, selectedEmail, showAdminPanel]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempInput.trim()) {
      const input = tempInput.trim().toLowerCase();

      let cleanUsername = input.split("@")[0];
      cleanUsername = cleanUsername.replace(/\.[a-z]{2,4}$/i, "");
      cleanUsername = cleanUsername.replace(/[^a-z0-9]/g, "");

      if (!cleanUsername) {
        setTempInput("");
        return;
      }

      const fullEmail = `${cleanUsername}@mailhey.com`;
      setCurrentUser(fullEmail);
      setCurrentView("inbox");
      window.history.pushState(null, "", `/${fullEmail}/inbox`);
    }
  };

  const handleFolderChange = (view: string) => {
    setCurrentView(view);
    setSelectedEmail(null);
    setSelectedIds([]);
    window.history.replaceState(null, "", `/${currentUser}/${view}`);
  };

  const handleEmailClick = async (email: Email) => {
    setIsEmailLoading(true);
    setSelectedEmail(email);
    window.history.replaceState(null, "", `/${currentUser}/${currentView}/${email.id}`);
    const username = currentUser.split('@')[0];
    const fullDetails = await fetchEmailDetail(email.id, username);

   if (fullDetails) {
      setSelectedEmail(prev => prev ? { ...prev, ...fullDetails } : null);
    }

    setIsEmailLoading(false);
  };

  const handleBackToInbox = () => {
    setSelectedEmail(null);
    window.history.replaceState(null, "", `/${currentUser}/${currentView}`);
  };

  const handleLogout = () => {
    setCurrentUser("");
    setTempInput("");
    setCurrentView("inbox");
    setSelectedEmail(null);
    setSelectedIds([]);
    setShowAdminPanel(false);
    window.history.replaceState(null, '', `/`);
  };

  const handleToggleStar = (id: string) => {
    const targetEmail = emails.find((e) => e.id === id);
    if (!targetEmail) return;

    const newStarredState = !targetEmail.starred;

    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, starred: newStarredState } : e)),
    );

    if (selectedEmail?.id === id) {
      setSelectedEmail((prev) => prev ? { ...prev, starred: newStarredState } : null);
    }

    if (typeof window !== "undefined") {
      const overrides = getStarOverrides();
      overrides[id] = newStarredState;
      localStorage.setItem("mailhey_star_overrides", JSON.stringify(overrides));
    }
  };

  const handleToggleRead = async (emailId: string) => {
    const targetEmail = emails.find((e) => e.id === emailId);
    if (!targetEmail) return;
    
    const newReadState = !targetEmail.read;
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, read: newReadState } : e))
    );
    
    import('@/lib/api').then(({ toggleEmailReadStatus }) => {
        toggleEmailReadStatus(emailId, targetEmail.read || false);
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchInbox(newPage);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === displayedEmails.length && displayedEmails.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedEmails.map((email) => email.id));
    }
  };

  const displayedEmails = emails.filter((email) => {
    if (currentView === "starred" && !email.starred) return false;
    if (currentView === "trash") return false;

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

  if (!currentUser) {
    if (showAdminPanel) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 flex flex-col transition-colors">
          <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-4">
            <button 
              onClick={() => {
                  setShowAdminPanel(false);
                  window.history.pushState(null, "", "/");
              }}
              className="self-start text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Sign In
            </button>
            <AdminDashboard 
             
              onSelectEmail={(username, emailId) => {
                setShowAdminPanel(false);
                setCurrentUser(username);
                setCurrentView("inbox");
                setPendingDeepLink(emailId); 
                router.push(`/${username}/inbox/${emailId}`);
              }} 
            />
          </div>
        </div>
      );
    }

    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <button
            onClick={() => {
                setShowAdminPanel(true);
                window.history.pushState(null, "", "/admin");
            }}
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-colors shadow-sm border border-gray-200 dark:border-gray-700 text-sm font-medium z-50"
        >
            <Shield size={16} className="text-orange-500" />
            Admin
        </button>

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
                onChange={(e) => {
                    const sanitizedValue = e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9@.]/g, '').replace(/^[0-9]+/, '');    
                    setTempInput(sanitizedValue);
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-between items-start mt-1">
              <span></span>
              <span className="text-xs text-gray-400">{remainingChars} characters remaining</span>
            </div>
            <div className="flex justify-end items-center mt-6 pt-4">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700 transition">Next</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F6F8FC] dark:bg-gray-900 transition-colors">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentView={currentView}
        setCurrentView={handleFolderChange}
        onLogoClick={handleLogout}
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
              {/*  Changed to an arrow function to prevent React event object errors */}
              <button onClick={() => fetchInbox()} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Retry</button>
            </div>
          ) : currentView === 'admin' ? (
            <AdminDashboard 
              
              onSelectEmail={(username, emailId) => {
                setCurrentUser(username);
                setCurrentView("inbox");
                setPendingDeepLink(emailId); 
                router.push(`/${username}/inbox/${emailId}`);
              }} 
            />
          ) : selectedEmail ? (
            <EmailDetail
              email={selectedEmail}
              currentUser={currentUser}
              onBack={handleBackToInbox}
              onToggleStar={handleToggleStar}
              isLoading={isEmailLoading}
            />
          ) : (
           <EmailList
              emails={displayedEmails}
              onEmailClick={handleEmailClick}
              onToggleStar={handleToggleStar}
              onRefresh={() => fetchInbox(1)}
              searchQuery={searchQuery}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onToggleRead={handleToggleRead}
            />
          )}
        </main>
      </div>
    </div>
  );
}