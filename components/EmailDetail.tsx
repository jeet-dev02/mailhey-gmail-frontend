"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Star, ChevronDown, Lock, FileJson, Code, Link as LinkIcon, Terminal, Paperclip, FileText, LayoutTemplate } from "lucide-react";
import { Email } from "@/lib/types";
import { analyzeEmailSecurity, sanitizeEmailBody } from "@/lib/security";
import { SecurityBanner } from "./SecurityBanner";

interface EmailDetailProps {
    email: Email;
    currentUser: string; // <-- ADDED: Fixes the TypeScript error
    onBack: () => void;
    onToggleStar: (id: string) => void;
    isLoading?: boolean; 
}

type TabType = 'HTML' | 'TEXT' | 'JSON' | 'RAW' | 'LINKS' | 'SMTP_LOG' | 'ATTACHMENTS';

export function EmailDetail({ email, currentUser, onBack, onToggleStar, isLoading }: EmailDetailProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('HTML');
    
    const rawDate = email.createdAt || email.created_at; 
    
    // UPDATED: Dynamically uses currentUser instead of hardcoded 'jeet'
    const displayTo = email.to 
        ? (email.to.includes('@') ? email.to : `${email.to}@mailhey.com`) 
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
        return `Return-Path: <${email.sender}>
Received: from mail.mailhey.com (127.0.0.1)
    by inbound-smtp.mailhey.local with SMTP id h182749;
    ${new Date(rawDate || Date.now()).toUTCString()}
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
    d=mailhey.com; s=s1024; t=17334444;
    h=From:To:Subject:Date:Message-ID:MIME-Version:Content-Type;
Message-ID: <${email.id}-${Date.now()}@mailhey.local>
Date: ${new Date(rawDate || Date.now()).toUTCString()}
From: "${email.sender.split('@')[0]}" <${email.sender}>
To: <${displayTo}>
Subject: ${email.subject}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="boundary-mailhey-12345"

--boundary-mailhey-12345
Content-Type: text/plain; charset="UTF-8"

${getPlainText(email.body)}

--boundary-mailhey-12345
Content-Type: text/html; charset="UTF-8"

${email.body}
--boundary-mailhey-12345--`;
    };

    const getSmtpLog = () => {
        return `[SERVER] 220 mx.mailhey.com ESMTP Postfix
[CLIENT] EHLO mail.sender.local
[SERVER] 250-mx.mailhey.com
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
[CLIENT] (Message Body Transmitted - ${email.body.length} bytes)
[CLIENT] .
[SERVER] 250 2.0.0 Ok: queued as ${email.id.toUpperCase()}
[CLIENT] QUIT
[SERVER] 221 2.0.0 Bye`;
    };

    // --- RENDERERS ---

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-colors">
                <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <button onClick={onBack} className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors"><ArrowLeft size={20} className="text-[#444746] dark:text-gray-300" /></button>
                </div>
                <div className="p-6 lg:px-10 lg:py-8 animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
                    <div className="h-32 bg-gray-100 dark:bg-gray-700/50 rounded w-full"></div>
                </div>
            </div>
        );
    }

    const securityAssessment = analyzeEmailSecurity(email);
    const extractedLinks = getLinks(email.body);

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
            <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 dark:border-gray-700 transition-colors shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors" title="Back to Inbox">
                    <ArrowLeft size={20} className="text-[#444746] dark:text-gray-300" />
                </button>
                <button onClick={() => onToggleStar(email.id)} className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors" title="Star">
                    <Star size={20} className={email.starred ? "fill-yellow-400 text-yellow-400" : "text-[#444746] dark:text-gray-300"} />
                </button>
                <button className="p-2 hover:bg-[#E0E2E6] dark:hover:bg-gray-700 rounded-full transition-colors" title="Delete">
                    <Trash2 size={20} className="text-[#444746] dark:text-gray-300" />
                </button>
            </div>

            <SecurityBanner assessment={securityAssessment} />

            {/* Email Header */}
            <div className="px-6 pt-6 lg:px-10 lg:pt-8 shrink-0">
                <h2 className="text-2xl font-normal text-[#1F1F1F] dark:text-gray-100 mb-6 transition-colors">{email.subject}</h2>
                <div className="flex items-start gap-3 mb-6">
                    <div className="h-10 w-10 mt-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg uppercase transition-colors shrink-0">
                        {email.sender.charAt(0)}
                    </div>
                    <div className="flex flex-col relative w-full">
                        <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-[#1F1F1F] dark:text-gray-200 text-sm transition-colors">{email.sender}</span>
                            <span className="text-xs text-[#444746] dark:text-gray-400">{displayDate}</span>
                        </div>
                        <div className="relative inline-block">
                            <button onClick={() => setIsDetailsOpen(!isDetailsOpen)} className="flex items-center gap-1 text-xs text-[#444746] dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mt-0.5">
                                to me <ChevronDown size={14} className={`transform transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDetailsOpen && (
                                <div className="absolute top-full left-0 mt-1 w-[320px] bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-4 z-20 text-[13px] text-[#444746] dark:text-gray-300">
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
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 px-6 lg:px-10 shrink-0 custom-scrollbar">
                <div className="flex space-x-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wider whitespace-nowrap transition-colors border-b-2 ${
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
            <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-10">
                
                {/* 1. HTML VIEW */}
                {activeTab === 'HTML' && (
                    <div 
                        className="text-[#1F1F1F] dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed transition-colors prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeEmailBody(email.body) }}
                    />
                )}

                {/* 2. PLAIN TEXT VIEW */}
                {activeTab === 'TEXT' && (
                    <pre className="text-sm text-[#1F1F1F] dark:text-gray-300 whitespace-pre-wrap font-mono">
                        {getPlainText(email.body)}
                    </pre>
                )}

                {/* 3. JSON VIEW */}
                {activeTab === 'JSON' && (
                    <pre className="text-sm text-[#1F1F1F] dark:text-gray-300 whitespace-pre-wrap font-mono">
                        {JSON.stringify(email, null, 2)}
                    </pre>
                )}

                {/* 4. RAW MIME VIEW */}
                {activeTab === 'RAW' && (
                    <pre className="text-sm text-[#1F1F1F] dark:text-gray-300 whitespace-pre-wrap font-mono">
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
                    <pre className="text-sm text-[#1F1F1F] dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                        {getSmtpLog()}
                    </pre>
                )}

                {/* 7. ATTACHMENTS */}
                {activeTab === 'ATTACHMENTS' && (
                    <div className="flex flex-col py-4 text-[#444746] dark:text-gray-400">
                        <p className="text-sm font-medium flex items-center gap-2">
                            <Paperclip size={16} /> No attachments found in multipart boundaries.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}