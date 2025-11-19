"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  taskPriorityValues,
  taskStatusValues,
} from "@/lib/validations";
import type { TaskFormValues } from "@/types/task";
import {
  taskPriorityOptions,
  taskStatusOptions,
} from "@/types/task";

const formSchema = z.object({
  title: z.string().min(2, "Title is required").max(140),
  description: z.string().max(2000).optional(),
  status: z.enum(taskStatusValues),
  priority: z.enum(taskPriorityValues),
  category: z.string().max(120).optional(),
  dueDate: z.date().nullable(),
  emailNotification: z.boolean(),
  calendarSync: z.boolean(),
});

type Props = {
  initialValues: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
};

export function TaskForm({ initialValues, onSubmit, isSubmitting }: Props) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [initialValues, form]);

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((values) =>
          onSubmit({
            ...values,
            description: values.description ?? "",
            category: values.category ?? "",
          })
        )}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Task title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Design, Product..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What needs to get done?"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.5fr_1.2fr]">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="w-full min-w-0 overflow-hidden">
                <FormLabel>Status</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full max-w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {taskStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="w-full min-w-0 overflow-hidden">
                <FormLabel>Priority</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full max-w-full">
                      <SelectValue placeholder="Priority" className="truncate" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {taskPriorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              return (
                <FormItem className="flex w-full min-w-0 flex-col overflow-hidden">
                <FormLabel>Due date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                            "w-full max-w-full justify-start text-left font-normal overflow-hidden",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate min-w-0">
                        {field.value
                              ? field.value.toLocaleDateString()
                          : "Select due date"}
                          </span>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                        onSelect={(date) => {
                          if (date) {
                            const selectedDate = new Date(date);
                            selectedDate.setHours(0, 0, 0, 0);
                            if (selectedDate >= today) {
                              field.onChange(date);
                            }
                          } else {
                            field.onChange(null);
                          }
                        }}
                        disabled={(date) => {
                          const dateToCheck = new Date(date);
                          dateToCheck.setHours(0, 0, 0, 0);
                          return dateToCheck < today;
                        }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => {
              const formatTime12Hour = (date: Date) => {
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const ampm = hours >= 12 ? "PM" : "AM";
                const hours12 = hours % 12 || 12;
                return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${ampm}`;
              };

              return (
                <FormItem className="flex w-full min-w-0 flex-col overflow-hidden">
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    {field.value ? (
                      <Input
                        type="time"
                        className="w-full max-w-full border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={`${String(field.value.getHours()).padStart(2, "0")}:${String(field.value.getMinutes()).padStart(2, "0")}`}
                        min={
                          (() => {
                            const today = new Date();
                            const selectedDate = new Date(field.value);
                            selectedDate.setHours(0, 0, 0, 0);
                            today.setHours(0, 0, 0, 0);
                            if (selectedDate.getTime() === today.getTime()) {
                              const now = new Date();
                              return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
                            }
                            return undefined;
                          })()
                        }
                        onChange={(event) => {
                          const [hours, minutes] = event.target.value
                            .split(":")
                            .map((value) => Number(value));
                          const updated = new Date(field.value);
                          updated.setHours(hours ?? 0);
                          updated.setMinutes(minutes ?? 0);
                          updated.setSeconds(0, 0);

                          // Validate: if date is today, time must be in the future
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const selectedDate = new Date(updated);
                          selectedDate.setHours(0, 0, 0, 0);

                          if (selectedDate.getTime() === today.getTime()) {
                            const now = new Date();
                            if (updated <= now) {
                              // If time is in the past, set to current time + 1 hour
                              const futureTime = new Date(now);
                              futureTime.setHours(now.getHours() + 1, 0, 0, 0);
                              field.onChange(futureTime);
                              return;
                            }
                          }

                          field.onChange(updated);
                        }}
                        disabled={isSubmitting}
                        onClick={(e) => {
                          e.currentTarget.showPicker?.();
                        }}
                      />
                    ) : (
                      <div className="flex h-9 items-center text-sm text-muted-foreground">
                        Select a date first
                      </div>
                    )}
                  </FormControl>
                <FormMessage />
              </FormItem>
              );
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="emailNotification"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4">
                <div className="space-y-1">
                  <FormLabel>Email alert</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Send a SendGrid email when the task is created.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="calendarSync"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4">
                <div className="space-y-1">
                  <FormLabel>Google Calendar</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Create or update an event for due dates.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving task...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save task
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
