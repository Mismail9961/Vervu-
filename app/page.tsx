"use client";

import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  const router = useRouter();

  const startSession = () => {
    router.push("/dashboard"); // or /session/start if you want to begin directly
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center">🎯 Interview Practice App</h1>
      <p className="text-lg text-center text-gray-600">Sharpen your skills with 10 AI-generated interview questions!</p>

      <SignedOut>
        <div className="flex gap-4">
          <SignInButton>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Sign In</button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400">Sign Up</button>
          </SignUpButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-col items-center gap-4">
          <UserButton afterSignOutUrl="/" />
          <button
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            onClick={startSession}
          >
            🚀 Start Interview
          </button>
        </div>
      </SignedIn>
    </main>
  );
}
