import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { google } from "googleapis";

const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET } = process.env;

if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
  console.error(
    "[gmail-auth] Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables.",
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  "urn:ietf:wg:oauth:2.0:oob",
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
  response_type: "code",
});

console.log("1. Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n2. Approve the permissions and copy the verification code.\n");

async function main() {
  const rl = readline.createInterface({ input, output });

  const code = await rl.question("3. Paste the verification code here: ");
  await rl.close();

  if (!code) {
    console.error("[gmail-auth] No verification code provided. Exiting.");
    process.exit(1);
  }

  const { tokens } = await oauth2Client.getToken(code.trim());

  if (!tokens.refresh_token) {
    console.error(
      "[gmail-auth] No refresh token returned. Ensure you selected the correct account and used the consent screen.",
    );
    process.exit(1);
  }

  console.log("\nSave this value as GMAIL_REFRESH_TOKEN:");
  console.log(tokens.refresh_token);
}

main().catch((error) => {
  console.error("[gmail-auth] Unexpected error:", error);
  process.exit(1);
});

