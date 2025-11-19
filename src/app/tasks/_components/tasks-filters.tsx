"use client";

import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { TaskFilters } from "@/types/task";
import { taskPriorityOptions, taskStatusOptions } from "@/types/task";

type Props = {
  filters: TaskFilters;
  onChange: (next: TaskFilters) => void;
  isLoading?: boolean;
};

const statusOptions = [{ label: "All statuses", value: "ALL" as const }];
const priorityOptions = [{ label: "All priorities", value: "ALL" as const }];
const defaultState: TaskFilters = {
  status: "ALL",
  priority: "ALL",
  search: "",
  showCompleted: false,
};

export function TaskFiltersBar({ filters, onChange, isLoading }: Props) {
  const handleReset = () => onChange(defaultState);

  return (
    <div className="space-y-3 rounded-xl border bg-card/50 backdrop-blur-sm p-3 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <div className="inline-flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isLoading}
          className="transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-1.5">
        <div className="min-w-0 space-y-1.5">
          <Label className="text-sm font-semibold">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onChange({ ...filters, status: value as TaskFilters["status"] })
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {[...statusOptions, ...taskStatusOptions].map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label className="text-sm font-semibold">Priority</Label>
          <Select
            value={filters.priority}
            onValueChange={(value) =>
              onChange({
                ...filters,
                priority: value as TaskFilters["priority"],
              })
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {[...priorityOptions, ...taskPriorityOptions].map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="task-search" className="text-sm font-semibold">Search</Label>
          <Input
            id="task-search"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label className="text-sm font-semibold">Show completed</Label>
          <div className="flex w-full items-center justify-center rounded-md border px-3 py-2 h-9">
            <Switch
              checked={filters.showCompleted}
              onCheckedChange={(checked) =>
                onChange({ ...filters, showCompleted: checked })
              }
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
