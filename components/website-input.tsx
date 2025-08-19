"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Loader2 } from "lucide-react"

export function WebsiteInput() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleFetchData = async () => {
    if (!url.trim()) return
    setIsLoading(true)

    try {
      const res = await fetch("/api/store-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()
      console.log("Stored website:", data)
    } catch (err) {
      console.error("Failed to fetch website:", err)
    } finally {
      setIsLoading(false)
      setUrl("")
    }
  }


  return (
    <Card className="p-4 shadow-md rounded-2xl bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800">
      <div className="space-y-4">
        <Label htmlFor="website-url" className="text-lg font-semibold text-slate-700 dark:text-gray-200">
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
            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600"
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
      </div>
    </Card>
  )
}
