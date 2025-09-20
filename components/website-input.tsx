"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Loader2, CheckCircle, XCircle } from "lucide-react"

export function WebsiteInput() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleFetchData = async () => {
    if (!url.trim()) return
    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/store-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: `✅ Website indexed: ${url}` })
      } else {
        setMessage({ type: "error", text: `❌ Failed to index: ${data.error || url}` })
      }
    } catch (err) {
      console.error("Failed to fetch website:", err)
      setMessage({ type: "error", text: `❌ Upload failed for ${url}` })
    } finally {
      setIsLoading(false)
      setUrl("")
    }
  }

  return (
    <Card className="p-4 shadow-medium rounded-2xl glass-card hover-lift">
      <div className="space-y-4">
        <Label htmlFor="website-url" className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
          Website Input
        </Label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
            <Input
              id="website-url"
              type="url"
              placeholder="Enter website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleFetchData}
            disabled={!url.trim() || isLoading}
            className="gradient-button text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Fetching...
              </>
            ) : (
              "Fetch Data"
            )}
          </Button>
        </div>

        {/* ✅ Success/Error message */}
        {message && (
          <div
            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${message.type === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {message.text}
          </div>
        )}
      </div>
    </Card>
  )
}
