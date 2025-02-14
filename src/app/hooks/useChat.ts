import { useEffect, useState } from "react"

interface Message {
  id: string
  role: "User" | "Bot"
  content: string
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState("")
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }



  const fetchChat = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/chat?chat_id=${chatId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch chat: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
      const mappedData = data.messages.map((message: Message) => ({
        id: message.id,
        role: message.role,
        content: message.content
      }))
      setMessages(mappedData)
    } catch (err) {
      console.error("Error fetching chat:", err)
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "Bot",
          content: "There's been an error fetching your chat history. Please refresh the page."
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }



  useEffect(() => {
    if (chatId) {
      fetchChat()
    }
  }, [chatId])




  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInput("")
    if (!input.trim()) return

    const userMessage: Message = { id: Date.now().toString(), role: "User", content: input }
    setMessages((prev) => [...prev, userMessage])

    setIsLoading(true)

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: input, chat_id: chatId }),
      })

      if (!res.ok) {
        throw new Error(`Failed to send message: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()

      if (!data.reply) {
        throw new Error("No response received from the bot")
      }

      const botMessage: Message = { id: Date.now().toString(), role: "Bot", content: data.reply }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "Bot",
        content: "There's been an error processing your message. Please refresh the page."
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }


  return { messages, input, handleInputChange, handleSubmit, isLoading, setChatId }
}
