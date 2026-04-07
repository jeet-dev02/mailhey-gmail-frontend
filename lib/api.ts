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
        
        console.log("RAW BACKEND DATA:", JSON.stringify(data, null, 2));

        const rawEmails = Array.isArray(data) ? data : (data.emails || []);

        return rawEmails.map((e: any) => ({
            id: e.id || Math.random().toString(),
            sender: e.from || e.sender || "Unknown",
            subject: e.subject || "(No Subject)",
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

export async function fetchAllSystemEmails() {
    try {
        
        const SIMULATION_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        
        const response = await fetch(`${SIMULATION_BACKEND_URL}/api/getallemails`, {
             cache: "no-store" 
        });

        if (!response.ok) throw new Error("Failed to fetch system emails");

        const json = await response.json();

        
        if (json && json.status === "success" && Array.isArray(json.data)) {
            json.data = json.data.map((e: any) => ({
                id: e.id || Math.random().toString(),
                sender: e.from || e.sender || "System",
                subject: e.subject || "(No Subject)",
                body: e.body || e.text || e.content || e.snippet || "",
                createdAt: e.createdAt || e.date_received || e.date || new Date().toISOString(),
                username: e.username || "unknown"
            }));
        }

        return json;

    } catch (error) {
        console.error(error);
        throw error; 
    }
}