/**
 * Email Notification Service
 * 
 * Handles sending email notifications via Gmail API for task lifecycle events:
 * - Task creation
 * - Task updates (any field change)
 * - Task deletion
 * 
 * Gracefully handles missing configuration - failures don't break the application.
 * 
 * @module lib/email
 */

import { sendGmail, gmailConfigured } from "./gmail";

const EMAIL_FROM = process.env.EMAIL_FROM;

type TaskEmailPayload = {
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  priority?: string;
  status?: string;
  category?: string | null;
};

const formatDate = (dueDate?: Date | null) => {
  if (!dueDate) return "No due date";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(dueDate);
};

const sendEmail = async (
  event: "created" | "updated" | "deleted",
  payload: TaskEmailPayload,
  userEmail: string
) => {
  if (!gmailConfigured || !EMAIL_FROM) {
    console.warn("[email] Missing Gmail configuration. Skipping email delivery.");
    return;
  }

  const subject =
    event === "created"
      ? `New task created: ${payload.title}`
      : event === "updated"
      ? `Task updated: ${payload.title}`
      : `Task deleted: ${payload.title}`;

  try {
    const emailBody = [
      `Title: ${payload.title}`,
      payload.description ? `Description: ${payload.description}` : null,
      payload.status ? `Status: ${payload.status.replace("_", " ")}` : null,
      `Priority: ${payload.priority ?? "MEDIUM"}`,
      payload.category ? `Category: ${payload.category}` : null,
      `Due: ${formatDate(payload.dueDate)}`,
      event === "updated"
        ? "\n--- Task has been updated with the latest information ---"
        : event === "deleted"
        ? "\n--- Task has been deleted from Smart To-Do ---"
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    await sendGmail({
      to: userEmail,
      subject,
      text: emailBody,
    });
  } catch (error) {
    console.error("[email] Failed to send task email", error);
  }
};

export const sendTaskCreatedEmail = (payload: TaskEmailPayload, userEmail: string) =>
  sendEmail("created", payload, userEmail);

export const sendTaskUpdatedEmail = (payload: TaskEmailPayload, userEmail: string) =>
  sendEmail("updated", payload, userEmail);

export const sendTaskDeletedEmail = (payload: TaskEmailPayload, userEmail: string) =>
  sendEmail("deleted", payload, userEmail);
