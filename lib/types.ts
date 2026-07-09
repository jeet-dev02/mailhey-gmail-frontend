export interface Attachment {
    filename: string;
    url: string;
    contentType: string;
}

export interface Email {
    id: string;
    subject: string;
    sender: string;
    to?: string;           
    recipient?: string;    
    body: string;
    body_html?: string;    
    createdAt: string;     
    created_at?: string;   
    tags?: string[]; 
    isRead?: boolean;
    read?: boolean;        
    starred?: boolean;
    attachments?: Attachment[]; 
}

export interface FetchEmailsResponse {
    emails: Email[];
}