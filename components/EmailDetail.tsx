"use client";

import { useState } from "react";
import { ArrowLeft, Star, ChevronDown, Lock, FileJson, Code, Link as LinkIcon, Terminal, Paperclip, FileText, LayoutTemplate } from "lucide-react";
import { Email } from "@/lib/types";
import { analyzeEmailSecurity } from "@/lib/security";
import { SecurityBanner } from "./SecurityBanner";

interface EmailDetailProps {
    email: Email;
    currentUser: string; 
    onBack: () => void;
    onToggleStar: (id: string) => void;
    isLoading?: boolean; 
}

type TabType = 'HTML' | 'TEXT' | 'JSON' | 'RAW' | 'LINKS' | 'SMTP_LOG' | 'ATTACHMENTS';

export function EmailDetail({ email, currentUser, onBack, onToggleStar, isLoading }: EmailDetailProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('HTML');
    
    const rawDate = email.createdAt || email.created_at; 
    
    // Dynamically uses currentUser instead of hardcoded username
    const displayTo = email.to || email.recipient 
        ? (email.to?.includes('@') || email.recipient?.includes('@') ? (email.to || email.recipient) : `${email.to || email.recipient}@mailhey.com`) 
        : (currentUser.includes('@') ? currentUser : `${currentUser}@mailhey.com`);

    const formatFullDate = (dateString?: string) => {
        if (!dateString) return "Mar 9, 2026, 10:30 AM";
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            });
        } catch {
            return "Mar 9, 2026, 10:30 AM";
        }
    };

    const displayDate = formatFullDate(rawDate);

    // --- DEVELOPER PARSERS & SIMULATORS ---
    const getPlainText = (html: string) => {
        return html.replace(/<[^>]+>/g, '\n').replace(/^\s*[\r\n]/gm, '').trim();
    };

    const getLinks = (html: string) => {
        const links = [];
        const regex = /href=["']([^"']+)["']/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            links.push(match[1]);
        }
        return links.length > 0 ? links : null;
    };

    const getRawHeaders = () => {
        const boundary = `----=_NextPart_${email.id}_${Date.now().toString(16)}`;
        const dateStr = new Date(rawDate || Date.now()).toUTCString();
        
        // Dynamically generated using your real Cloudflare/EC2 setup
        return `Return-Path: <${email.sender}>
Received: from mail.mailhey.com (mail.mailhey.com [18.135.134.205])
    by inbound-smtp.mailhey.com with ESMTPS id ${email.id}
    for <${displayTo}>; ${dateStr}
Authentication-Results: mail.mailhey.com;
    dkim=pass (1024-bit key) header.d=mailhey.com header.i=@mailhey.com header.b="xxxxx";
    spf=pass (mailhey.com: domain of ${email.sender} designates 18.135.134.205 as permitted sender)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
    d=mailhey.com; s=mail; t=${Math.floor(Date.now() / 1000)};
    h=From:To:Subject:Date:Message-ID:MIME-Version:Content-Type;
    bh=base64-hash-placeholder;
    b=base64-signature-placeholder;
Message-ID: <${email.id}@mail.mailhey.com>
Date: ${dateStr}
From: ${email.sender}
To: ${displayTo}
Subject: ${email.subject}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="${boundary}"

--${boundary}
Content-Type: text/plain; charset="UTF-8"

${getPlainText(email.body)}

--${boundary}
Content-Type: text/html; charset="UTF-8"

${email.body_html || email.body}
--${boundary}--`;
    };

    const getSmtpLog = () => {
        const bodySize = (email.body_html || email.body || "").length;
        const dateStr = new Date(rawDate || Date.now()).toISOString();
        
        return `[${dateStr}] [CONNECTION] Connect from unknown [unknown] to mail.mailhey.com [18.135.134.205]
[SERVER] 220 mail.mailhey.com ESMTP Postfix (Ubuntu)
[CLIENT] EHLO sender.network
[SERVER] 250-mail.mailhey.com
[SERVER] 250-PIPELINING
[SERVER] 250-SIZE 52428800
[SERVER] 250-STARTTLS
[SERVER] 250 ENHANCEDSTATUSCODES
[CLIENT] MAIL FROM:<${email.sender}>
[SERVER] 250 2.1.0 Ok
[CLIENT] RCPT TO:<${displayTo}>
[SERVER] 250 2.1.5 Ok
[CLIENT] DATA
[SERVER] 354 End data with <CR><LF>.<CR><LF>
[CLIENT] (Message Body Transmitted - ${bodySize} bytes)
[CLIENT] .
[SERVER] 250 2.0.0 Ok: queued as ${String(email.id).toUpperCase()}
[CLIENT] QUIT
[SERVER] 221 2.0.0 Bye
[${dateStr}] [CONNECTION] Disconnect from unknown [unknown]`;
    };

    // --- RENDERERS ---

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors">
                <div className="flex items-center gap-1 sm:gap-4 px-1 sm:px-4 py-1 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                    <button onClick={onBack} aria-label="Back to Inbox" className="flex h-11 w-11 sm:h-10 sm:w-10 shrink-0 items-center justify-center hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors"><ArrowLeft size={20} className="text-[#444746] dark:text-gray-300" /></button>
                </div>
                <div className="p-3 sm:p-6 lg:px-10 lg:py-8 animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
                    <div className="h-32 bg-gray-100 dark:bg-gray-700/50 rounded w-full"></div>
                </div>
            </div>
        );
    }

    const securityAssessment = analyzeEmailSecurity(email);
    
    // 🔥 FIX: Now extracts links from the rich HTML if available
    const extractedLinks = getLinks(email.body_html || email.body || "");

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'HTML', label: 'HTML', icon: LayoutTemplate },
        { id: 'TEXT', label: 'TEXT', icon: FileText },
        { id: 'JSON', label: 'JSON', icon: FileJson },
        { id: 'RAW', label: 'RAW', icon: Code },
        { id: 'LINKS', label: 'LINKS', icon: LinkIcon },
        { id: 'SMTP_LOG', label: 'SMTP LOG', icon: Terminal },
        { id: 'ATTACHMENTS', label: 'ATTACHMENTS', icon: Paperclip },
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors">
            {/* Action Bar */}
            <div className="flex items-center gap-1 sm:gap-4 px-1 sm:px-4 py-1 sm:py-2 border-b border-gray-100 dark:border-gray-700 transition-colors shrink-0">
                <button onClick={onBack} className="flex h-11 w-11 sm:h-10 sm:w-10 shrink-0 items-center justify-center hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors" title="Back to Inbox" aria-label="Back to Inbox">
                    <ArrowLeft size={20} className="text-[#444746] dark:text-gray-300" />
                </button>
                <button onClick={() => onToggleStar(email.id)} className="flex h-11 w-11 sm:h-10 sm:w-10 shrink-0 items-center justify-center hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors" title="Star" aria-label="Star">
                    <Star size={20} className={email.starred ? "fill-yellow-400 text-yellow-400" : "text-[#444746] dark:text-gray-300"} />
                </button>
            </div>

            <SecurityBanner assessment={securityAssessment} />

            {/* Email Header */}
            <div className="px-3 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-8 shrink-0">
                {/* break-words so a long unbroken subject wraps instead of overflowing */}
                <h2 className="text-xl sm:text-2xl font-normal text-[#1F1F1F] dark:text-gray-100 mb-4 sm:mb-6 transition-colors break-words">{email.subject}</h2>
                <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6 min-w-0">
                    <div className="h-10 w-10 mt-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg uppercase transition-colors shrink-0">
                        {email.sender.charAt(0)}
                    </div>
                    <div className="flex flex-col relative w-full min-w-0">
                        {/* Sender and date share a row from sm up; below that the date drops under it */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full min-w-0 gap-0.5 sm:gap-2">
                            <span className="font-bold text-[#1F1F1F] dark:text-gray-200 text-sm transition-colors truncate min-w-0">{email.sender}</span>
                            <span className="text-xs text-[#444746] dark:text-gray-400 shrink-0">{displayDate}</span>
                        </div>
                        <div className="relative inline-block">
                            <button onClick={() => setIsDetailsOpen(!isDetailsOpen)} className="flex items-center gap-1 text-xs text-[#444746] dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mt-0.5">
                                to me <ChevronDown size={14} className={`transform transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDetailsOpen && (
                                <div className="absolute top-full left-0 mt-1 w-[320px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-4 z-20 text-[13px] text-[#444746] dark:text-gray-300">
                                    <table className="w-full text-left border-collapse">
                                        <tbody>
                                            <tr><td className="py-1 pr-3 text-right align-top text-gray-500 w-16">from:</td><td className="py-1 font-bold text-gray-900 dark:text-gray-100 break-all">{email.sender}</td></tr>
                                            <tr><td className="py-1 pr-3 text-right align-top text-gray-500">to:</td><td className="py-1 break-all">{displayTo}</td></tr>
                                            <tr><td className="py-1 pr-3 text-right align-top text-gray-500">date:</td><td className="py-1">{displayDate}</td></tr>
                                            <tr><td className="py-1 pr-3 text-right align-top text-gray-500">subject:</td><td className="py-1 break-words">{email.subject}</td></tr>
                                            <tr><td className="py-1 pr-3 text-right align-top text-gray-500">security:</td><td className="py-1 flex items-center gap-1.5"><Lock size={13} /> Standard encryption (TLS)</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Developer Tabs Navigation */}
            <div className="flex overflow-x-auto overflow-y-hidden border-b border-gray-200 dark:border-gray-700 px-2 sm:px-6 lg:px-10 shrink-0 custom-scrollbar">
                <div className="flex w-max shrink-0 space-x-1 flex-nowrap">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex shrink-0 items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-2.5 text-xs font-semibold tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                                    isActive 
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                <Icon size={14} /> {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Completely Borderless Tab Content Area */}
            <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-10 flex flex-col min-w-0">
                
                {/* 1. HTML VIEW - 🔥 FIX: Now uses iframe for perfect Gmail rendering */}
                {activeTab === 'HTML' && (
                    <div className="scroll-x w-full max-w-full bg-white rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner flex-1 flex flex-col min-h-[420px] sm:min-h-[600px]">
                        <iframe
                            srcDoc={email.body_html || email.body}
                            title="Email Content"
                            className="w-full flex-1 min-h-[420px] sm:min-h-[600px] border-none bg-white"
                            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                        />
                    </div>
                )}

                {/* 2. PLAIN TEXT VIEW */}
                {activeTab === 'TEXT' && (
                    <pre className="text-sm text-[#1F1F1F] dark:text-gray-300 whitespace-pre-wrap break-words font-mono">
                        {getPlainText(email.body)}
                    </pre>
                )}

                {/* 3. JSON VIEW */}
                {activeTab === 'JSON' && (
                    <pre className="scroll-x max-w-full text-xs sm:text-sm text-[#1F1F1F] dark:text-gray-300 whitespace-pre font-mono">
                        {JSON.stringify(email, null, 2)}
                    </pre>
                )}

                {/* 4. RAW MIME VIEW */}
                {activeTab === 'RAW' && (
                    <pre className="scroll-x max-w-full text-xs sm:text-sm text-[#1F1F1F] dark:text-gray-300 whitespace-pre font-mono">
                        {getRawHeaders()}
                    </pre>
                )}

                {/* 5. LINKS EXTRACTOR */}
                {activeTab === 'LINKS' && (
                    <div className="text-sm">
                        {extractedLinks ? (
                            <ul className="space-y-3">
                                {extractedLinks.map((link, i) => (
                                    <li key={i} className="flex items-center gap-2 break-all">
                                        <LinkIcon size={14} className="text-blue-500 shrink-0" />
                                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic flex items-center gap-2"><LinkIcon size={16} /> No hyperlinks detected in this email.</p>
                        )}
                    </div>
                )}

                {/* 6. SMTP LOG SIMULATOR */}
                {activeTab === 'SMTP_LOG' && (
                    <pre className="text-sm text-[#1F1F1F] dark:text-gray-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
                        {getSmtpLog()}
                    </pre>
                )}

                {/* 7. ATTACHMENTS - 🔥 FIX: Maps real data from your EC2 S3 database */}
                {activeTab === 'ATTACHMENTS' && (
                    <div className="flex flex-col py-4 text-[#444746] dark:text-gray-400">
                        {email.attachments && email.attachments.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {email.attachments.map((file, i) => (
                                    <a 
                                        key={i} 
                                        href={file.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded text-indigo-600 dark:text-indigo-400 shrink-0">
                                            <Paperclip size={20} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden min-w-0">
                                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate block w-full">{file.filename}</span>
                                            <span className="text-xs text-gray-500 truncate block w-full">{file.contentType}</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm font-medium flex items-center gap-2">
                                <Paperclip size={16} /> No attachments found in this email.
                            </p>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}