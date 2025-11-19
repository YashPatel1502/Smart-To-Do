"use client";

import { useState, useEffect, Suspense } from "react";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function GoogleCalendarButtonInner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  useEffect(() => {
    // Handle OAuth callback messages
    const error = searchParams.get("error");
    const connected = searchParams.get("google_connected");

    if (connected === "true") {
      toast.success("Google Calendar connected successfully!");
      checkConnectionStatus();
      // Clean up URL
      router.replace("/tasks");
    } else if (error) {
      if (error === "google_auth_failed") {
        toast.error("Failed to connect Google Calendar. Please try again.");
      }
      router.replace("/tasks");
    }
  }, [searchParams, router]);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch("/api/user/calendar-status");
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
      }
    } catch (error) {
      console.error("Failed to check calendar status", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    window.location.href = "/api/auth/google";
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch("/api/user/disconnect-calendar", {
        method: "POST",
      });

      if (response.ok) {
        setIsConnected(false);
        toast.success("Google Calendar disconnected");
      } else {
        toast.error("Failed to disconnect calendar");
      }
    } catch (error) {
      toast.error("Failed to disconnect calendar");
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (isConnected) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleDisconnect}
        className="transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
        Calendar Connected
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleConnect}
      className="transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <Calendar className="mr-2 h-4 w-4" />
      Connect Calendar
    </Button>
  );
}

export function GoogleCalendarButton() {
  return (
    <Suspense fallback={
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    }>
      <GoogleCalendarButtonInner />
    </Suspense>
  );
}

