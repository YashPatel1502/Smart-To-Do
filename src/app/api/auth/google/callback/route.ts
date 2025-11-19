import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.AUTH_URL
  ? `${process.env.AUTH_URL}/api/auth/google/callback`
  : `http://localhost:3000/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", request.url)
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL("/tasks?error=google_auth_failed", request.url)
      );
    }

    if (!code || !state || state !== session.user.id) {
      return NextResponse.redirect(
        new URL("/tasks?error=invalid_callback", request.url)
      );
    }

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/tasks?error=not_configured", request.url)
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      // If no refresh token, try to get it from existing user record
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { googleRefreshToken: true },
      });

      if (!user?.googleRefreshToken) {
        return NextResponse.redirect(
          new URL("/tasks?error=no_refresh_token", request.url)
        );
      }
    } else {
      // Store refresh token in user's record
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          googleRefreshToken: tokens.refresh_token,
          googleCalendarId: "primary", // Default to primary calendar
        },
      });
    }

    return NextResponse.redirect(
      new URL("/tasks?google_connected=true", request.url)
    );
  } catch (error) {
    console.error("[auth/google/callback] Failed", error);
    return NextResponse.redirect(
      new URL("/tasks?error=google_auth_failed", request.url)
    );
  }
}

