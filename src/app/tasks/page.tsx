import { TasksDashboard } from "./_components/tasks-dashboard";

export default function TasksPage() {
  return (
    <main className="min-h-screen bg-muted/30 py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <TasksDashboard />
      </div>
    </main>
  );
}
