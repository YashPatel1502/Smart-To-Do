import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        googleRefreshToken: true,
        googleCalendarId: true,
      },
    });

    return NextResponse.json({
      connected: !!user?.googleRefreshToken,
      calendarId: user?.googleCalendarId || "primary",
    });
  } catch (error) {
    console.error("[user/calendar-status] Failed", error);
    return NextResponse.json(
      { error: "Failed to check calendar status" },
      { status: 500 }
    );
  }
}

