"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Trash2, FileText, Globe, Type } from "lucide-react"

interface DataSource {
  id: string
  type: "text" | "file" | "website" | "vtt"
  name: string
  source: string
  createdAt: Date
}

export function RagStore() {
  // Mock data for demonstration
  const [dataSources, setDataSources] = useState<DataSource[]>([])

  const loadSources = async () => {
    try {
      const res = await fetch("/api/list-sources")
      const contentType = res.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json()
        setDataSources(data.sources)
      } else {
        const text = await res.text()
        console.error("Expected JSON, got:", text)
      }
    } catch (err) {
      console.error("Failed to fetch sources:", err)
    }
  }

  useEffect(() => {
    loadSources()
  }, [])

  const handleRemove = async (source: DataSource) => {
    try {
      await fetch("/api/delete-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: source.id, source: source.source }),
      })
      setDataSources((prev) => prev.filter((s) => s.id !== source.id))
    } catch (err) {
      console.error("Failed to delete source:", err)
    }
  }


  const getIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4 text-blue-500 dark:text-gray-400" />
      case "file":
        return <FileText className="h-4 w-4 text-green-500 dark:text-gray-400" />
      case "vtt":
        return <FileText className="h-4 w-4 text-orange-500 dark:text-gray-400" />
      case "website":
        return <Globe className="h-4 w-4 text-purple-500 dark:text-gray-400" />
      default:
        return <FileText className="h-4 w-4 text-slate-500 dark:text-gray-500" />
    }
  }

  return (
    <Card className="p-4 shadow-md rounded-2xl bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800">
      <div className="space-y-4">
        <Label className="text-lg font-semibold text-slate-700 dark:text-gray-200">Indexed Data Sources</Label>

        {dataSources.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300 dark:text-gray-600" />
            <p>No data sources indexed yet</p>
            <p className="text-sm">Add text, upload files, or fetch from websites above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dataSources.map((source) => (
              <div
                key={source.id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-sm transition-shadow"
              >
                {getIcon(source.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-gray-200 truncate">{source.name}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Added {new Date(source.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(source)}
                  className="text-slate-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
