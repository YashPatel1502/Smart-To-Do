/**
 * Task API Route Handler (by ID)
 * 
 * Handles PATCH (update task) and DELETE (delete task) requests.
 * Includes validation, error handling, and proper HTTP status codes.
 * 
 * @module app/api/tasks/[taskId]/route
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";

import { deleteTask, updateTask } from "@/lib/tasks";
import { taskUpdateSchema } from "@/lib/validations";

type RouteParams = {
  params: Promise<{
    taskId: string;
  }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PATCH /api/tasks/[taskId]
 * 
 * Updates an existing task by ID.
 * Supports partial updates (only provided fields are updated).
 * Automatically syncs calendar events and sends email notifications.
 * 
 * @returns JSON response with updated task or error message
 */
export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { taskId } = await context.params;
    
    // Validate taskId format
    if (!taskId || typeof taskId !== "string" || taskId.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid task ID" },
        { status: 400 }
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

    const payload = taskUpdateSchema.parse({
      ...body,
      id: taskId,
    });
    const task = await updateTask(payload, session.user.id, session.user.email);
    return NextResponse.json({ data: task });
  } catch (error) {
    console.error("[api/tasks/:id] PATCH failed", error);
    
    // Handle validation errors
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
    
    // Handle known errors (e.g., "Task not found")
    if (error instanceof Error) {
      const status = error.message === "Task not found" ? 404 : 400;
      return NextResponse.json(
        { error: error.message },
        { status }
      );
    }
    
    return NextResponse.json(
      { error: "Unable to update task. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[taskId]
 * 
 * Deletes a task by ID.
 * Automatically cleans up associated calendar events and sends deletion email.
 * 
 * @returns JSON response with deleted task or error message
 */
export async function DELETE(
  _: NextRequest,
  context: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { taskId } = await context.params;
    
    // Validate taskId format
    if (!taskId || typeof taskId !== "string" || taskId.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const task = await deleteTask(taskId, session.user.id, session.user.email);
    return NextResponse.json({ data: task });
  } catch (error) {
    console.error("[api/tasks/:id] DELETE failed", error);
    
    // Handle known errors (e.g., "Task not found")
    if (error instanceof Error) {
      const status = error.message === "Task not found" ? 404 : 400;
      return NextResponse.json(
        { error: error.message },
        { status }
      );
    }
    
    return NextResponse.json(
      { error: "Unable to delete task. Please try again." },
      { status: 500 }
    );
  }
}
