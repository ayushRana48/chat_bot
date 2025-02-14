import { NextResponse } from "next/server"
import { supabase } from "../../../supabase"

export async function POST(req: Request) {
  try {
    const { username } = await req.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Check if chat exists
    const { data: chat, error: chatError } = await supabase
      .from("chat")
      .select("*")
      .eq("chat_id", username)
      .single()

    if (chatError && chatError.details !== "The result contains 0 rows") {
      return NextResponse.json({ error: "Error retrieving chat data", details: chatError.message }, { status: 500 })
    }

    if (!chat) {
      // Create new chat session
      const { error: insertError } = await supabase.from("chat").insert({ chat_id: username })
      if (insertError) {
        return NextResponse.json({ error: "Failed to create new chat session", details: insertError.message }, { status: 500 })
      }

      // Add initial bot message
      const { error: messageError } = await supabase.from("message").insert([
        {
          chat_id: username,
          content: `Hi ${username}! I'm Jarvis from Collectwise. Our records show that you currently owe $2400. Are you able to resolve this debt today?`,
          role: "Bot",

        },
      ]).select()
                                
      if (messageError) {
        return NextResponse.json({ error: "Failed to insert initial bot message", details: messageError.message }, { status: 500 })
      }

      return NextResponse.json({ message: "New chat session created", chat_id: username })
    } else {
      // Fetch last known payment plan


      // Customize return message based on last interaction
      const welcomeBackMessage = "Welcome back! How can I assist you today?"

      // Insert the bot message
      const { error: messageInsertError } = await supabase.from("message").insert([
        {
          chat_id: username,
          content: welcomeBackMessage,
          role: "Bot",
        },
      ])

      if (messageInsertError) {
        return NextResponse.json({ error: "Failed to insert bot message", details: messageInsertError.message }, { status: 500 })
      }

      return NextResponse.json({ message: "Returning user greeted", chat_id: username })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
