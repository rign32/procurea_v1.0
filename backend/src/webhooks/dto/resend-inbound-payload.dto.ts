/**
 * Resend Inbound webhook payload (type: "email.received").
 *
 * Shape from https://resend.com/docs/dashboard/webhooks/event-types
 * Fields we care about:
 *  - data.email_id: idempotency key (unique per event)
 *  - data.from / data.to: routing
 *  - data.headers: contains In-Reply-To / References for threading
 *  - data.text / data.html: body used for AI triage
 */
export interface ResendInboundEmail {
    email_id: string;
    created_at: string;
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    message_id: string;
    subject: string;
    text?: string;
    html?: string;
    headers: Record<string, string>;
    attachments?: Array<{
        id: string;
        filename: string;
        content_type: string;
        content_disposition?: string;
        content_id?: string;
    }>;
}

export interface ResendInboundPayload {
    type: 'email.received' | string;
    created_at: string;
    data: ResendInboundEmail;
}
