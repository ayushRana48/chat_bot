"use client"

import { useEffect, useState } from "react"
import { useChat } from "../hooks/useChat"
import { Send, Bot, User } from "lucide-react"
import { Button } from "../../components/button"
import { Input } from "../../components/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/card"
import { useParams } from "next/navigation"

export default function ChatBot() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setChatId } = useChat()
  const [chatStarted, setChatStarted] = useState(false)
  const chatId = useParams().chat_id

  useEffect(() => {
    if (chatId && typeof chatId === "string") {
      console.log("chatId", chatId)
      setChatId(chatId)
    }
  }, [chatId, setChatId])


  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("onSubmit", input)
    e.preventDefault()
    if (input.trim()) {
      console.log("onSubmit2", input)
      handleSubmit(e)
      if (!chatStarted) setChatStarted(true)
    }
  }

 

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Jarvis from Collectwise</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto space-y-4">
          {!chatStarted && <div className="text-center text-gray-500 mt-8">Start chatting with the AI bot!</div>}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "User" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "User" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.role === "User" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  <span className="font-semibold">{message.role === "User" ? "You" : "Jarvis"}</span>
                </div>
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-black rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span className="font-semibold">Jarvis</span>
                </div>
                <p>Thinking...</p>
                <div className="mt-2 flex space-x-1">
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <form onSubmit={onSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

