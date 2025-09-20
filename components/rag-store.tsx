"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, FileText, Globe, Type, Search, Filter, BarChart3, Calendar } from "lucide-react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [showAnalytics, setShowAnalytics] = useState(false)

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

  // Filter and search data sources
  const filteredSources = dataSources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === "all" || source.type === filterType
    return matchesSearch && matchesFilter
  })

  // Calculate analytics
  const analytics = {
    total: dataSources.length,
    byType: dataSources.reduce((acc, source) => {
      acc[source.type] = (acc[source.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    recent: dataSources.filter(source => {
      const daysDiff = (Date.now() - new Date(source.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    }).length
  }

  return (
    <Card className="p-4 shadow-medium rounded-2xl glass-card hover-lift">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
            Indexed Data Sources
          </Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="animate-slide-up p-4 bg-slate-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700 dark:text-gray-200">{analytics.total}</div>
                <div className="text-xs text-slate-500">Total Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.recent}</div>
                <div className="text-xs text-slate-500">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.byType.text || 0}</div>
                <div className="text-xs text-slate-500">Text Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics.byType.website || 0}</div>
                <div className="text-xs text-slate-500">Websites</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200"
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="file">Files</option>
            <option value="website">Websites</option>
            <option value="vtt">VTT</option>
          </select>
        </div>

        {dataSources.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300 dark:text-gray-600" />
            <p>No data sources indexed yet</p>
            <p className="text-sm">Add text, upload files, or fetch from websites above</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
            {filteredSources.map((source) => (
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
