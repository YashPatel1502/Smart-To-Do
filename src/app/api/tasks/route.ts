/**
 * Tasks API Route Handler
 * 
 * Handles GET (list tasks) and POST (create task) requests.
 * Includes validation, error handling, and proper HTTP status codes.
 * 
 * @module app/api/tasks/route
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";

import { createTask, listTasks } from "@/lib/tasks";
import { taskCreateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/tasks
 * 
 * Retrieves tasks with optional query parameters for filtering.
 * Supports: status, priority, category, search
 * 
 * @returns JSON response with tasks array or error message
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tasks = await listTasks(request.nextUrl.searchParams, session.user.id);
    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error("[api/tasks] GET failed", error);
    
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Unable to fetch tasks. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * 
 * Creates a new task with validation.
 * Automatically triggers email/calendar integrations if enabled.
 * 
 * @returns JSON response with created task (201) or error message
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Handle invalid JSON body
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const payload = taskCreateSchema.parse(body);
    const task = await createTask(payload, session.user.id, session.user.email);
    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    console.error("[api/tasks] POST failed", error);
    
    // Handle validation errors with detailed messages
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { 
          error: firstError?.message ?? "Invalid task data",
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    // Handle known errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Unable to create task. Please try again." },
      { status: 500 }
    );
  }
}
