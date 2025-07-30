"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";

type Session = {
  id: string;
  createdAt: string;
  score: number;
};

const roles = ["FULLSTACK", "FRONTEND", "BACKEND", "DEVOPS"];
const modes = ["EASY", "MEDIUM", "HARD"];

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState("FULLSTACK");
  const [mode, setMode] = useState("MEDIUM");
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch("/api/session/list")
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions));
  }, []);

  async function startSession() {
    const res = await fetch("/api/session/create", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role, mode }),
    });
    const data = await res.json();
    if (data?.id) {
      router.push(`/session/${data.id}`);
    } else {
      console.error("Session ID missing from response:", data);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-10">
      <SignedOut>
        <p className="text-center text-lg">
          Please sign in to access your dashboard.
        </p>
      </SignedOut>

      <SignedIn>
        <div>
          <h1 className="text-2xl font-bold mb-4">Start New Interview</h1>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Select Role</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold">
                Select Difficulty
              </label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                {modes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            onClick={startSession}
          >
            🎯 Start Session
          </button>
        </div>

        <div>
          <h2 className="text-xl font-bold mt-10 mb-4">Previous Sessions</h2>
          {sessions.length === 0 ? (
            <p>No sessions found yet.</p>
          ) : (
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="border p-3 rounded hover:bg-gray-50 flex justify-between"
                >
                  <span>📅 {new Date(s.createdAt).toLocaleString()}</span>
                  <span>✅ Score: {s.score}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SignedIn>
    </main>
  );
}
