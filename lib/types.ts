export interface Email {
    id: string;
    subject: string;
    sender: string;
    body: string;
    created_at: string;
    tags?: string[]; 
    isRead?: boolean;
    starred?: boolean;
}

export interface FetchEmailsResponse {
    emails: Email[];
    // Add other pagination fields if the backend returns them (e.g. total, page, etc)
}
