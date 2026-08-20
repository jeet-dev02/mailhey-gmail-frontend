// lib/api.ts
import { Email } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://mailhey-jkcw.onrender.com";
const API_BASE = `${API_BASE_URL}/api`; 

//  Interface for pagination response
export interface FetchEmailsResponse {
    emails: Email[];
    currentPage: number;
    totalPages: number;
}

//  Returns FetchEmailsResponse instead of just Promise<Email[]>
export async function fetchEmails(recipient: string = "user2@mailhey.com", page: number = 1): Promise<FetchEmailsResponse> {
    try {
        const response = await fetch(`${API_BASE}/fetch-emails?recipient=${encodeURIComponent(recipient)}&page=${page}`, {
             cache: "no-store" 
        });

        if (!response.ok) throw new Error("Failed to fetch emails from Render");

        const data = await response.json();
        
        console.log("RAW BACKEND DATA:", JSON.stringify(data, null, 2));

        const rawEmails = Array.isArray(data) ? data : (data.emails || []);

        const formattedEmails = rawEmails.map((e: any) => ({
            id: e.id || Math.random().toString(),
            sender: e.from || e.sender || "Unknown",
            subject: e.subject || "(No Subject)",
            body: e.snippet || e.body || e.text || e.content || "", 
            date: e.date_received || e.createdAt || new Date().toISOString(),
            read: e.read === 1 || e.read === true, 
            starred: false
        }));

        //  Return the formatted emails alongside pagination info
        return {
            emails: formattedEmails,
            currentPage: data.currentPage || 1,
            totalPages: data.totalPages || 1
        };

    } catch (error) {
        console.error("Error in fetchEmails:", error);
        // Fallback return matches the new FetchEmailsResponse type
        return { emails: [], currentPage: 1, totalPages: 1 };
    }
}

export async function fetchEmailDetail(emailId: string | number, inboxUsername: string) {
    try {
        const response = await fetch(`${API_BASE}/fetch-email-by-id/${emailId}?inbox=${encodeURIComponent(inboxUsername)}`, {
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch email details. Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error in fetchEmailDetail:", error);
        return null;
    }
}

export async function fetchAllSystemEmails() {
    try {
        const response = await fetch(`${API_BASE}/getallemails`, {
             cache: "no-store" 
        });

     
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Render Backend Error - Status: ${response.status} ${response.statusText}`);
            console.error(`Render Error Details:`, errorText);
            throw new Error(`Backend rejected request: ${response.status}`);
        }

        const json = await response.json();

        if (json && json.status === "success" && Array.isArray(json.data)) {
            json.data = json.data.map((e: any) => ({
                id: e.id || Math.random().toString(),
                sender: e.from || e.sender || "System",
                subject: e.subject || "(No Subject)",
                body: e.body || e.text || e.content || e.snippet || "",
                createdAt: e.createdAt || e.date_received || e.date || new Date().toISOString(),
               username: e.recipient || e.to || e.username || "Unknown User"
            }));
        }

        return json;

    } catch (error) {
        console.error("Error in fetchAllSystemEmails:", error);
        throw error; 
    }
}

//  Function to hit your mark-read endpoint with an absolute state.
//  Bulk actions need this: "Mark as read" over a mixed selection must set every
//  message to read rather than flipping each one individually.
//  Best-effort only: this endpoint currently answers 401, so read state is kept
//  in localStorage by the caller. fetch() does not throw on a 4xx, so without the
//  response.ok check below the rejection is invisible.
export async function setEmailReadStatus(emailId: string | number, read: boolean) {
    try {
        const response = await fetch(`${API_BASE}/mark-read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: emailId, read })
        });

        if (!response.ok) {
            console.warn(`mark-read rejected for ${emailId}: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error updating read status:", error);
    }
}

export async function toggleEmailReadStatus(emailId: string | number, currentReadStatus: boolean) {
    // We flip the status: if it was read (true), we send false to mark unread
    return setEmailReadStatus(emailId, !currentReadStatus);
}