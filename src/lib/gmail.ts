import { google } from "googleapis";

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_USER,
} = process.env;

const oauth2Client =
  GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET
    ? new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET)
    : null;

if (oauth2Client && GMAIL_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN,
  });
}

const gmail = oauth2Client
  ? google.gmail({
      version: "v1",
      auth: oauth2Client,
    })
  : null;

type GmailSendParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const base64UrlEncode = (input: string) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const buildRawMessage = ({ to, subject, text, html }: GmailSendParams) => {
  const message = [
    `From: ${GMAIL_USER}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    html
      ? 'Content-Type: text/html; charset="UTF-8"'
      : 'Content-Type: text/plain; charset="UTF-8"',
    "",
    html ?? text,
  ].join("\r\n");

  return base64UrlEncode(message);
};

export const gmailConfigured =
  Boolean(gmail) &&
  Boolean(GMAIL_USER) &&
  Boolean(GMAIL_REFRESH_TOKEN) &&
  Boolean(GMAIL_CLIENT_ID) &&
  Boolean(GMAIL_CLIENT_SECRET);

export const sendGmail = async (params: GmailSendParams) => {
  if (!gmailConfigured || !gmail || !GMAIL_USER) {
    throw new Error("Gmail API is not configured");
  }

  const raw = buildRawMessage(params);

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });
};

