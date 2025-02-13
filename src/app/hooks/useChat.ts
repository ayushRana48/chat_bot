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
    const res = await fetch(`/api/chat?chat_id=${chatId}`);
    const data = await res.json()
    console.log("data", data)
    const mappedData = data.messages.map((message: Message) => ({ id: message.id, role: message.role, content: message.content }))
    console.log("mappedData", mappedData)
    setMessages(mappedData)
  }


  useEffect(() => {
    fetchChat()
  }, [chatId])


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInput("")
    console.log("input", input)
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
      const data = await res.json()
      console.log("data", data)
      

      const botMessage: Message = { id: Date.now().toString(), role: "Bot", content: data.reply }
      setMessages((prev) => [...prev, botMessage])
      console.log(messages)
    } catch (error) {
      console.error("Chat error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return { messages, input, handleInputChange, handleSubmit, isLoading, setChatId }
}
