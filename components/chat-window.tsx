"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, Bot, User, Search, Download, MessageSquare, X, Filter } from "lucide-react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const messageTemplates = [
    "What information do you have about...?",
    "Can you summarize the key points from...?",
    "Find all documents related to...",
    "What are the main topics covered in...?",
    "Compare the information between...",
    "Explain the concept of...",
    "What are the latest updates on...?",
    "Search for data about..."
  ]

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Filter messages based on search query
  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const handleTemplateSelect = (template: string) => {
    setInputValue(template)
    setShowTemplates(false)
  }

  const exportChat = () => {
    const chatData = {
      exportDate: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))
    }
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-4 shadow-strong rounded-2xl h-[1000px] flex flex-col glass-card hover-lift">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
          Chat with RAG Assistant
        </Label>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportChat}
            className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="mb-4 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Message Templates */}
      {showTemplates && (
        <div className="mb-4 animate-slide-up">
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {messageTemplates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect(template)}
                className="text-left justify-start text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                {template}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {(searchQuery ? filteredMessages : messages).map((message) => (
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
          className="gradient-button text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
