export interface Email {
    id: string;
    subject: string;
    sender: string;
    to?: string;           
    body: string;
    createdAt: string;     
    created_at?: string;   
    tags?: string[]; 
    isRead?: boolean;
    starred?: boolean;
}

export interface FetchEmailsResponse {
    emails: Email[];
    
}