"use client" // Required for client-side navigation in App Router

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "../components/input"
import { Button } from "../components/button"

export default function MyComponent() {
  const router = useRouter()
  const [username, setUsername] = useState("")

  const goToChat = async () => {
    console.log("onSubmit", username) // Debugging: Ensure username is correct
    const response = await fetch("/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username }),
    })
    console.log("response", response)
    if (!username) return // Prevent navigation if username is empty
    router.push(`/${username}`) // Navigate to /username (which maps to app/[chat_id]/page.tsx)

  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">Welcome</h1>
        <p className="text-center text-gray-600">Enter your username to get started</p>
          <Input type="text" placeholder="Username" className="w-full" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Button onClick={goToChat} className="w-full">Submit</Button>
      </div>
    </div>
  )
}

