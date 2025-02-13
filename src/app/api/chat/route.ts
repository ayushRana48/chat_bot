import { NextRequest, NextResponse } from "next/server"
import { supabase } from "../../../supabase"

export async function GET(request: NextRequest): Promise<NextResponse> {
    const chat_id =request.nextUrl.searchParams.get("chat_id")
    console.log(chat_id,'chat_id')
    try {
    if (!chat_id) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
    }

    // Fetch chat details
    const { data: chat, error: chatError } = await supabase.from("chat").select("*").eq("chat_id", chat_id).single()
    if (chatError || !chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // Fetch messages
    const { data: messages, error: messagesError } = await supabase
      .from("message")
      .select("*")
      .eq("chat_id", chat_id)
      .order("created_at")

    if (messagesError) {
      return NextResponse.json({ error: "Error fetching messages" }, { status: 500 })
    }

    return NextResponse.json({ chat, messages })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", errorMessage: error }, { status: 500 })
  }
}
