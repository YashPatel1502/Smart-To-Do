/**
 * Gmail API Client
 * 
 * Provides a simple interface for sending emails via Gmail API using OAuth2.
 * Handles OAuth2 client initialization, message encoding, and email sending.
 * 
 * Setup:
 * 1. Create OAuth2 credentials in Google Cloud Console
 * 2. Generate refresh token using scripts/gmail-auth.ts
 * 3. Set environment variables: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_USER
 * 
 * @module lib/gmail
 */

import { google } from "googleapis";

// Environment variables for Gmail API configuration
const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_USER,
} = process.env;

/**
 * OAuth2 client for Gmail API authentication
 * Initialized only if CLIENT_ID and CLIENT_SECRET are provided
 */
const oauth2Client =
  GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET
    ? new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET)
    : null;

// Set refresh token if available (enables automatic token refresh)
if (oauth2Client && GMAIL_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN,
  });
}

/**
 * Gmail API client instance
 * Only initialized if OAuth2 client is configured
 */
const gmail = oauth2Client
  ? google.gmail({
      version: "v1",
      auth: oauth2Client,
    })
  : null;

/**
 * Parameters for sending an email via Gmail API
 */
type GmailSendParams = {
  /** Recipient email address */
  to: string;
  /** Email subject line */
  subject: string;
  /** Plain text email body */
  text: string;
  /** Optional HTML email body (if provided, HTML is used instead of text) */
  html?: string;
};

/**
 * Encodes a string to base64url format (RFC 4648)
 * Used for Gmail API raw message encoding
 * 
 * @param input - String to encode
 * @returns Base64url-encoded string
 */
const base64UrlEncode = (input: string): string =>
  Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/**
 * Builds a raw email message in RFC 2822 format
 * Encodes the message for Gmail API (base64url)
 * 
 * @param params - Email parameters (to, subject, text, html)
 * @returns Base64url-encoded raw email message
 */
const buildRawMessage = ({ to, subject, text, html }: GmailSendParams): string => {
  // Build RFC 2822 email message
  const message = [
    `From: ${GMAIL_USER}`,
    `To: ${to}`,
    // Base64-encode subject for UTF-8 support
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    // Set content type based on whether HTML is provided
    html
      ? 'Content-Type: text/html; charset="UTF-8"'
      : 'Content-Type: text/plain; charset="UTF-8"',
    "", // Empty line separates headers from body
    html ?? text, // Email body
  ].join("\r\n");

  // Encode message for Gmail API
  return base64UrlEncode(message);
};

/**
 * Checks if Gmail API is fully configured
 * All required environment variables must be set
 * 
 * @returns true if Gmail API is configured and ready to use
 */
export const gmailConfigured: boolean =
  Boolean(gmail) &&
  Boolean(GMAIL_USER) &&
  Boolean(GMAIL_REFRESH_TOKEN) &&
  Boolean(GMAIL_CLIENT_ID) &&
  Boolean(GMAIL_CLIENT_SECRET);

/**
 * Sends an email via Gmail API
 * 
 * @param params - Email parameters (to, subject, text, html)
 * @throws Error if Gmail API is not configured
 * @throws Error if email sending fails
 * 
 * @example
 * ```ts
 * await sendGmail({
 *   to: "user@example.com",
 *   subject: "Hello",
 *   text: "Plain text body",
 *   html: "<p>HTML body</p>"
 * });
 * ```
 */
export const sendGmail = async (params: GmailSendParams): Promise<void> => {
  if (!gmailConfigured || !gmail || !GMAIL_USER) {
    throw new Error("Gmail API is not configured. Please set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, and GMAIL_USER environment variables.");
  }

  // Build and encode the email message
  const raw = buildRawMessage(params);

  // Send email via Gmail API
  await gmail.users.messages.send({
    userId: "me", // "me" refers to the authenticated user
    requestBody: {
      raw, // Base64url-encoded RFC 2822 message
    },
  });
};

