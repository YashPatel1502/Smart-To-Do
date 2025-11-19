/**
 * Google Calendar Integration Service
 * 
 * Handles calendar event synchronization for tasks with due dates:
 * - Creates calendar events when tasks are created
 * - Updates calendar events when tasks are modified
 * - Deletes calendar events when tasks are deleted or due dates removed
 * 
 * Uses OAuth 2.0 with refresh tokens for authentication.
 * Gracefully handles missing configuration - failures don't break the application.
 * 
 * @module lib/calendar
 */

import { google } from "googleapis";
import { prisma } from "./prisma";

const calendarId = process.env.GOOGLE_CALENDAR_ID;
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

type CalendarEventInput = {
  title: string;
  description?: string | null;
  dueDate: Date;
  priority?: string;
  taskId: string;
  userId?: string; // Optional: for per-user calendar sync
};

const getOAuthClient = async (userId?: string) => {
  if (!clientId || !clientSecret) {
    console.warn("[calendar] Missing Google OAuth credentials.");
    return { client: null, calendarId: null };
  }

  // Try to get user's refresh token if userId provided
  let userRefreshToken: string | null = null;
  let userCalendarId: string | null = null;
  
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { googleRefreshToken: true, googleCalendarId: true },
      });
      if (user?.googleRefreshToken) {
        userRefreshToken = user.googleRefreshToken;
        userCalendarId = user.googleCalendarId ?? "primary";
      }
    } catch (error) {
      console.error("[calendar] Failed to fetch user token", error);
    }
  }

  // Only use user's token (no fallback to env var for per-user calendar)
  // If userId is provided, we require the user to have connected their calendar
  if (userId && !userRefreshToken) {
    console.warn("[calendar] User has not connected Google Calendar.");
    return { client: null, calendarId: null };
  }

  // Fallback to env var only if no userId provided (backward compatibility)
  const token = userRefreshToken || (userId ? null : refreshToken);
  const calId = userCalendarId || (userId ? "primary" : calendarId || "primary");

  if (!token) {
    console.warn("[calendar] Missing refresh token.");
    return { client: null, calendarId: null };
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({
    refresh_token: token,
  });

  return { client: oauth2Client, calendarId: calId };
};

const buildEventBody = (input: CalendarEventInput) => {
  const end = new Date(input.dueDate.getTime() + 30 * 60 * 1000);
  const descriptionParts = [
    input.description,
    `Priority: ${input.priority ?? "MEDIUM"}`,
    `Task ID: ${input.taskId}`,
  ].filter(Boolean);

  return {
    summary: input.title,
    description: descriptionParts.join("\n"),
    start: {
      dateTime: input.dueDate.toISOString(),
    },
    end: {
      dateTime: end.toISOString(),
    },
  };
};

export const createCalendarEvent = async (input: CalendarEventInput) => {
  const { client: auth, calendarId: calId } = await getOAuthClient(input.userId);
  if (!auth || !calId) {
    console.warn("[calendar] Missing OAuth client or calendar ID, skipping event sync.");
    return null;
  }

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.events.insert({
      calendarId: calId,
      requestBody: buildEventBody(input),
    });
    return response.data.id ?? null;
  } catch (error) {
    console.error("[calendar] Failed to create event", error);
    return null;
  }
};

export const updateCalendarEvent = async (
  eventId: string,
  input: CalendarEventInput
) => {
  if (!eventId) return null;
  const { client: auth, calendarId: calId } = await getOAuthClient(input.userId);
  if (!auth || !calId) return null;

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.events.patch({
      calendarId: calId,
      eventId,
      requestBody: buildEventBody(input),
    });
    return response.data.id ?? eventId;
  } catch (error) {
    console.error("[calendar] Failed to update event", error);
    return null;
  }
};

export const deleteCalendarEvent = async (
  eventId?: string | null,
  userId?: string
) => {
  if (!eventId) return;
  const { client: auth, calendarId: calId } = await getOAuthClient(userId);
  if (!auth || !calId) return;

  try {
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.delete({
      calendarId: calId,
      eventId,
    });
  } catch (error) {
    console.error("[calendar] Failed to delete event", error);
  }
};
