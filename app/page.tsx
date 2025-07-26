import QueueList from "./QueueList";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Queue Manager</h1>
        <QueueList />
      </div>
    </main>
  );
}