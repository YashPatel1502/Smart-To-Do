"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TaskWithDates } from "@/types/task";

const genericMessages = [
  "Hey, what's in your mind?",
  "Ready to tackle something new?",
  "Time to check off some tasks!",
  "What's next on your list?",
  "Let's get things done!",
  "Stay focused, stay productive!",
  "One task at a time, you've got this!",
  "What are you working on today?",
  "Keep moving forward!",
  "Small steps lead to big achievements!",
];

type Props = {
  className?: string;
  speed?: number; // milliseconds between messages
  tasks?: TaskWithDates[];
};

export function AnimatedText({ className, speed = 3000, tasks = [] }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const allMessages = useMemo(() => {
    const taskMessages: string[] = [];
    
    // Generate personalized messages for tasks
    tasks.forEach((task) => {
      if (task.status !== "COMPLETED") {
        const taskName = task.title.length > 30 
          ? `${task.title.substring(0, 30)}...` 
          : task.title;
        
        const priorityMessages = [
          `How is your "${taskName}" looking, any progress?`,
          `What's the status of "${taskName}"?`,
          `How's "${taskName}" coming along?`,
          `Any updates on "${taskName}"?`,
        ];
        
        taskMessages.push(...priorityMessages);
      }
    });

    // Mix generic and task-specific messages
    const mixed = [...genericMessages, ...taskMessages];
    return mixed.length > 0 ? mixed : genericMessages;
  }, [tasks]);

  useEffect(() => {
    if (allMessages.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % allMessages.length);
        setIsVisible(true);
      }, 400); // fade out duration
    }, speed);

    return () => clearInterval(interval);
  }, [speed, allMessages.length]);

  if (allMessages.length === 0) return null;

  return (
    <div
      className={cn(
        "overflow-hidden text-center",
        className
      )}
    >
      <p
        className={cn(
          "text-lg font-bold tracking-wide bg-gradient-to-r from-foreground via-primary via-50% to-foreground bg-clip-text text-transparent bg-[length:200%_auto] transition-all duration-700 ease-in-out",
          isVisible
            ? "opacity-100 translate-y-0 scale-100 animate-shimmer"
            : "opacity-0 -translate-y-6 scale-90"
        )}
      >
        {allMessages[currentIndex]}
      </p>
    </div>
  );
}

