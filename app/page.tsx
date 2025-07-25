import TaskManager from "./TaskManager";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Task Manager</h1>
        <TaskManager />
      </div>
    </main>
  );
}