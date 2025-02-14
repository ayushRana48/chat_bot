"use client" // Required for client-side navigation in App Router

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "../components/input"
import { Button } from "../components/button"

export default function MyComponent() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const goToChat = async () => {
    if (!username.trim()) return;
    

    try {
      setLoading(true)
      setError("") // clear any previous error
      const trimmedUsername = username.trim().toLowerCase();
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUsername }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sign in failed");
      }
      router.push(`/${trimmedUsername}`);
    } catch (error) {
      console.error("Error during sign in:", error)
      setError("An error occurred. Please refresh the page.");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">Welcome</h1>
        <p className="text-center text-gray-600">Enter your username to get started</p>
        <Input
          type="text"
          placeholder="Username"
          className="w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {error && (
          <div className="text-red-500 text-center">
            {error}
          </div>
        )}
        <Button
          onClick={goToChat}
          className="w-full"
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign In"}
        </Button>
      </div>
    </div>
  )
}
