"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function DataSourceInput() {
  const [textData, setTextData] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!textData.trim()) return
    setIsLoading(true)
    setSuccessMessage("")

    try {
      const res = await fetch("/api/store-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textData }),
      })

      const data = await res.json()
      console.log("Stored text:", data)

      setTextData("")
      setSuccessMessage("✅ Text saved successfully!")
    } catch (err) {
      console.error("Failed to save text:", err)
      setSuccessMessage("❌ Failed to save text.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-4 shadow-medium rounded-2xl glass-card hover-lift">
      <div className="space-y-4">
        <Label
          htmlFor="text-input"
          className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent"
        >
          Enter Data (Text Source)
        </Label>
        <Textarea
          id="text-input"
          placeholder="Paste your text content here..."
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <Button
          onClick={handleSave}
          disabled={!textData.trim() || isLoading}
          className="gradient-button text-white w-full"
        >
          {isLoading ? "Saving..." : "Save to RAG Store"}
        </Button>

        {successMessage && (
          <p
            className={`text-sm ${successMessage.startsWith("✅")
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
              }`}
          >
            {successMessage}
          </p>
        )}
      </div>
    </Card>
  )
}
