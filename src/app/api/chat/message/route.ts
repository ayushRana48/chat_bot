import dotenv from 'dotenv';
import { b, resetBamlEnvVars } from '../../../../../baml_client';
import { supabase } from '../../../../supabase';
import { NextResponse } from "next/server"

dotenv.config();
resetBamlEnvVars({ OPENAI_API_KEY: process.env.OPENAI_API_KEY || ""});



/**
 * Helper: Fetch the last N messages from a chat as context.
 * Returns a string like:
 * "Bot: Hello! Our records show that you owe $2400.
 *  User: I can't pay that right now."
 */
async function getConversationContext(chat_id: string, limit: number = 5): Promise<string> {
  console.log(process.env.SUPABASE_URL,'supabase url')
  console.log(process.env.SUPABASE_ANON_KEY)
  const { data: messages, error } = await supabase
    .from("message")
    .select("role, content")
    .eq("chat_id", chat_id)
    .order("created_at", { ascending: false })
    .limit(limit);

  console.log("messages", messages)
  
  if (error) {
    console.error("Error fetching conversation context:", error);
    return "";
  }
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
    const { reply, plan, action } = response;

    // Save conversation history in Supabase
    const { error: updateMessageError } = await supabase
      .from("message")
      .insert([
        { chat_id, content: user_message, role: "User" },
        { chat_id, content: reply, role: "Bot" }
      ]);

    if (updateMessageError) {
      console.error("Error updating messages:", updateMessageError);
      throw new Error(updateMessageError.message);
    }

    return NextResponse.json({ reply, plan, action }, { status: 200 });
  } catch (error) {
    console.error("Error processing chatbot response:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}