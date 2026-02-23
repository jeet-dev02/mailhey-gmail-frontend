// lib/api.ts
import { Email } from "./types";

const API_BASE = "/api"; 

export async function fetchEmails(recipient: string = "user2@mailhey.com", page: number = 1): Promise<Email[]> {
    try {
        const response = await fetch(`${API_BASE}/fetch-emails?recipient=${encodeURIComponent(recipient)}&page=${page}`, {
             cache: "no-store" 
        });

        if (!response.ok) throw new Error("Failed");

        const data = await response.json();
        
        // DEBUG: This will print the exact data from Vercel in your VS Code terminal!
        console.log("RAW BACKEND DATA:", JSON.stringify(data, null, 2));

        const rawEmails = Array.isArray(data) ? data : (data.emails || []);

        return rawEmails.map((e: any) => ({
            id: e.id || Math.random().toString(),
            sender: e.from || e.sender || "Unknown",
            subject: e.subject || "(No Subject)",
            
            // THE ULTIMATE FIX: Check every possible name for the body text
            body: e.body || e.text || e.content || e.snippet || "", 
            
            date: e.createdAt || e.date_received || new Date().toISOString(),
            read: true,
            starred: false
        }));

    } catch (error) {
        console.error(error);
        return [];
    }
}