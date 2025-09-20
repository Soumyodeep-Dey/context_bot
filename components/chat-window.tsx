"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your RAG assistant. I can help you find information from your indexed data sources. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: inputValue }),
      })

      const data = await res.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.answer || "No answer found.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      console.error("Failed to fetch chat answer:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Use a consistent formatter
  const time = new Date()
  const formatted = time
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase() // Always "PM" or "AM"

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="p-4 shadow-md rounded-2xl h-[800px] flex flex-col bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800">
      <Label className="text-lg font-semibold text-slate-700 dark:text-gray-200 mb-4">
        Chat with RAG Assistant
      </Label>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"
              }`}
          >
            {message.type === "ai" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-slate-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-slate-600 dark:text-gray-300" />
                </div>
              </div>
            )}

            <div
              className={`max-w-[80%] p-3 rounded-2xl ${message.type === "user"
                  ? "bg-blue-600 text-white dark:bg-gray-700 dark:text-gray-200"
                  : "bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200"
                }`}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${message.type === "user"
                    ? "text-blue-100 dark:text-gray-400"
                    : "text-slate-500 dark:text-gray-400"
                  }`}
              >
                {formatted}
              </p>
            </div>

            {message.type === "user" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white dark:text-gray-300" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-slate-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-slate-600 dark:text-gray-300" />
              </div>
            </div>
            <div className="bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200 p-3 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-slate-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-slate-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask a question..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
