/**
 * Magic Link Email Service
 * 
 * Sends magic link authentication emails via Gmail API
 * 
 * @module lib/email-auth
 */

import { sendGmail, gmailConfigured } from "./gmail";

const EMAIL_FROM = process.env.EMAIL_FROM;
const GMAIL_USER = process.env.GMAIL_USER;

type MagicLinkEmailParams = {
  email: string;
  url: string;
};

export const sendMagicLinkEmail = async ({ email, url }: MagicLinkEmailParams) => {
  if (!gmailConfigured || !EMAIL_FROM || !GMAIL_USER) {
    console.warn(
      "[email-auth] Missing Gmail configuration. Magic link email not sent."
    );
    console.warn("[email-auth] Gmail configured:", gmailConfigured);
    console.warn("[email-auth] EMAIL_FROM:", EMAIL_FROM || "Missing");
    // In development, log the URL instead
    if (process.env.NODE_ENV === "development") {
      console.log("[email-auth] Magic link URL:", url);
    }
    return;
  }

  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sign in to Smart To-Do</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Smart To-Do</h1>
          </div>
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Sign in to your account</h2>
            <p style="color: #666; font-size: 16px;">Click the button below to sign in to Smart To-Do. This link will expire in 24 hours.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">Sign in to Smart To-Do</a>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">${url}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">If you didn't request this email, you can safely ignore it.</p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Sign in to Smart To-Do

Click the link below to sign in to your account. This link will expire in 24 hours.

${url}

If you didn't request this email, you can safely ignore it.
    `.trim();

    await sendGmail({
      to: email,
      subject: "Sign in to Smart To-Do",
      text: emailText,
      html: emailHtml,
    });

    console.log(`[email-auth] Magic link sent to ${email}`);
  } catch (error: any) {
    console.error("[email-auth] Failed to send magic link email", error);
    
    throw error;
  }
};

