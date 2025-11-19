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
};

const getOAuthClient = () => {
  if (!clientId || !clientSecret || !refreshToken) {
    console.warn("[calendar] Missing Google OAuth credentials.");
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
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
  if (!calendarId) {
    console.warn("[calendar] Missing GOOGLE_CALENDAR_ID, skipping event sync.");
    return null;
  }

  const auth = getOAuthClient();
  if (!auth) return null;

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.events.insert({
      calendarId,
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
  if (!calendarId || !eventId) return null;
  const auth = getOAuthClient();
  if (!auth) return null;

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: buildEventBody(input),
    });
    return response.data.id ?? eventId;
  } catch (error) {
    console.error("[calendar] Failed to update event", error);
    return null;
  }
};

export const deleteCalendarEvent = async (eventId?: string | null) => {
  if (!calendarId || !eventId) return;
  const auth = getOAuthClient();
  if (!auth) return;

  try {
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  } catch (error) {
    console.error("[calendar] Failed to delete event", error);
  }
};
