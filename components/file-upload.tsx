"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, File, CheckCircle, XCircle } from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
}

export function FileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter((file) =>
      ["application/pdf", "text/csv", "text/plain"].includes(file.type)
    )

    for (const file of validFiles) {
      const id = `${file.name}-${file.size}-${file.lastModified}`
      setUploadedFiles((prev) => [
        ...prev,
        { id, name: file.name, size: file.size, type: file.type },
      ])

      const formData = new FormData()
      formData.append("file", file)

      try {
        const res = await fetch("/api/store-file", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()

        if (res.ok) {
          setMessage({ type: "success", text: `✅ ${file.name} indexed successfully!` })
        } else {
          setMessage({ type: "error", text: `❌ Failed to index ${file.name}: ${data.error}` })
        }
      } catch (err) {
        console.error("Failed to upload file:", err)
        setMessage({ type: "error", text: `❌ Upload failed for ${file.name}` })
      }
    }
  }

  return (
    <Card className="p-4 shadow-medium rounded-2xl glass-card hover-lift">
      <div className="space-y-4">
        <Label className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">Upload Files</Label>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragOver
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105 shadow-soft"
              : "border-slate-300 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-600 hover:scale-102"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-gray-500 mb-4" />
          <p className="text-slate-600 dark:text-gray-300 mb-2">Drag and drop files here, or click to select</p>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">Supports PDF, CSV, and TXT files</p>
          <input
            type="file"
            multiple
            accept=".pdf,.csv,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button asChild variant="outline">
            <label htmlFor="file-upload" className="cursor-pointer">
              Choose Files
            </label>
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

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-600 dark:text-gray-300">Uploaded Files:</Label>
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-gray-800 rounded-lg"
              >
                <File className="h-4 w-4 text-slate-500 dark:text-gray-400" />
                <span className="text-sm text-slate-700 dark:text-gray-200 flex-1">{file.name}</span>
                <span className="text-xs text-slate-500 dark:text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
