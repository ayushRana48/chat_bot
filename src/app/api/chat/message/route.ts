import dotenv from 'dotenv';
import { b, resetBamlEnvVars } from '../../../../../baml_client';
import { supabase } from '../../../../supabase';
import { NextResponse } from "next/server"

dotenv.config();
resetBamlEnvVars({ OPENAI_API_KEY: process.env.OPENAI_API_KEY || "" });



/**
 * Helper: Fetch the last N messages from a chat as context.
 * Returns a string like:
 * "Bot: Hello! Our records show that you owe $2400.
 *  User: I can't pay that right now."
 */
 async function getConversationContext(chat_id: string, limit: number = 7): Promise<string> {
  const { data: messages, error } = await supabase
    .from("message")
    .select("role, content")
    .eq("chat_id", chat_id)
    .order("created_at", { ascending: false })  // Directly query in the correct order
    .limit(limit);

    console.log("messages", messages)

  if (error) {
    console.error("Error fetching conversation context:", error);
    return "";
  }

  if (!messages || !Array.isArray(messages)) return "";

  messages.reverse()
  return messages.map(msg => `${msg.role}: ${msg.content}`).join("\n");
}


export async function POST(req: Request) {
  try {
    const { user_message, chat_id } = await req.json();

    if (!user_message || !chat_id) {
      return NextResponse.json(
        { error: "Missing user_message or chat_id in request body" },
        { status: 400 }
      );
    }

    // Get recent conversation context from Supabase
    const conversationContext = await getConversationContext(chat_id);

    // Call BAML function to generate a response
    console.log("conversationContext", conversationContext)
    const response = await b.NegotiationResponse(user_message, conversationContext);
    const { reply } = response;

    // Save conversation history in Supabase

    //would have atomicity here with prisma, but supabase doesn't support it
    //staying with supabase for now for simplicity
    const { error: updateMessageError } = await supabase
      .from("message")
      .insert([
        { chat_id, content: user_message, role: "User" },
        { chat_id, content: reply, role: "Bot" }
      ]);

    if (updateMessageError) {
      console.error("Error updating messages:", updateMessageError);
      return NextResponse.json({
        error: "Failed to insert messages",
        details: updateMessageError.message || JSON.stringify(updateMessageError)
      }, { status: 500 });
    }

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("Error processing chatbot response:", error);
    console.error("Unexpected error in chatbot response:", error);
    return NextResponse.json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : JSON.stringify(error)
    }, { status: 500 });
  }
}