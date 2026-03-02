import { Email } from "./types";
import sanitizeHtml from 'sanitize-html';

export type SecurityStatus = "Safe" | "Suspicious" | "Critical Risk";

export interface SecurityAssessment {
    status: SecurityStatus;
    flags: string[];
}

export const analyzeEmailSecurity = (email: Email): SecurityAssessment => {
    const flags: string[] = [];
    let status: SecurityStatus = "Safe";

    // --- VECTOR 1: Homograph & Non-ASCII Detection ---
    const asciiRegex = /^[\x00-\x7F]*$/;
    if (!asciiRegex.test(email.sender)) {
        flags.push("Sender address contains hidden or non-standard characters (Possible Homograph Attack).");
        status = "Critical Risk";
    }

    // --- VECTOR 2: Domain Mismatch / VIP Spoofing ---
    const lowerSender = email.sender.toLowerCase();
    const isInternal = lowerSender.includes("@mailhey.com");
    const claimsToBeVIP = /(admin|support|security|billing|helpdesk)/i.test(lowerSender) || /(admin|support|security)/i.test(email.subject);

    if (claimsToBeVIP && !isInternal) {
        flags.push("Sender claims to be internal staff but originates from an external or spoofed domain.");
        status = "Critical Risk";
    }

    // --- VECTOR 3: Urgency & Credential Harvesting ---
    const phishingKeywords = [
        "password reset", "urgent action", "account suspended", 
        "verify your identity", "immediate attention", "login required",
        "update your billing"
    ];

    const combinedText = `${email.subject} ${email.body}`.toLowerCase();
    let keywordMatches = 0;

    phishingKeywords.forEach(keyword => {
        if (combinedText.includes(keyword)) keywordMatches++;
    });

    if (keywordMatches > 0) {
        flags.push(`Detected ${keywordMatches} high-risk urgency or credential harvesting phrase(s).`);
        if (status === "Safe") status = "Suspicious"; 
        if (keywordMatches >= 2) status = "Critical Risk"; 
    }

    return { status, flags };
};

// NEW: The XSS Sandbox function using sanitize-html
export const sanitizeEmailBody = (rawHtml: string): string => {
    return sanitizeHtml(rawHtml, {
        allowedTags: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'div', 'span'
        ],
        allowedAttributes: {
            '*': ['class', 'style'], // Allow styling on all tags
            'a': ['href', 'target', 'rel'] // Safely allow links
        },
        // Explicitly ban dangerous URI schemes like javascript:
        allowedSchemes: ['http', 'https', 'mailto'],
        // Automatically append secure rel attributes to external links
        transformTags: {
            'a': sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' })
        }
    });
};