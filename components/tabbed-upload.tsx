"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Type, Upload, Globe, FileText } from "lucide-react"
import { DataSourceInput } from "./data-source-input"
import { FileUpload } from "./file-upload"
import { BulkUpload } from "./bulk-upload"
import { WebsiteInput } from "./website-input"

type TabType = "text" | "file" | "bulk" | "website"

interface Tab {
  id: TabType
  label: string
  icon: React.ReactNode
  component: React.ReactNode
}

export function TabbedUpload() {
  const [activeTab, setActiveTab] = useState<TabType>("text")

  const tabs: Tab[] = [
    {
      id: "text",
      label: "Text",
      icon: <Type className="h-4 w-4" />,
      component: <DataSourceInput />
    },
    {
      id: "file",
      label: "File",
      icon: <Upload className="h-4 w-4" />,
      component: <FileUpload />
    },
    {
      id: "bulk",
      label: "Bulk",
      icon: <FileText className="h-4 w-4" />,
      component: <BulkUpload />
    },
    {
      id: "website",
      label: "Website",
      icon: <Globe className="h-4 w-4" />,
      component: <WebsiteInput />
    }
  ]

  return (
    <Card className="shadow-medium rounded-2xl glass-card hover-lift overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-none border-0 h-12 transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                : "text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </div>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </Card>
  )
}
