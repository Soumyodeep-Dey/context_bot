"use client"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface UploadResult {
  success: boolean
  filename: string
  chunks: number
  error?: string
}

interface BatchResult {
  total: number
  successful: number
  failed: number
  totalChunks: number
  details: UploadResult[]
}

export function BulkUpload() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [results, setResults] = useState<BatchResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files)
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setResults(null)

    try {
      const formData = new FormData()
      
      // Add all files to form data
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i])
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/batch-upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (data.success) {
        setResults(data.results)
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setResults({
        total: files.length,
        successful: 0,
        failed: files.length,
        totalChunks: 0,
        details: Array.from(files).map(file => ({
          success: false,
          filename: file.name,
          chunks: 0,
          error: error instanceof Error ? error.message : "Unknown error"
        }))
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop()
    switch (ext) {
      case 'vtt':
        return <FileText className="h-4 w-4 text-orange-500" />
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'txt':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'csv':
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="p-6 shadow-md rounded-2xl bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800">
      <div className="space-y-6">
        <div>
          <Label className="text-lg font-semibold text-slate-700 dark:text-gray-200">
            Bulk Upload Files
          </Label>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Upload multiple files at once (supports PDF, TXT, CSV, VTT files)
          </p>
        </div>

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-slate-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-gray-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 dark:text-gray-300 mb-2">
            Drag and drop files here, or click to select
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.csv,.vtt"
            onChange={handleFileSelect}
            className="hidden"
            id="bulk-file-input"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("bulk-file-input")?.click()}
            disabled={isUploading}
          >
            Select Files
          </Button>
        </div>

        {/* Selected Files */}
        {files && files.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-gray-200">
              Selected Files ({files.length})
            </Label>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {Array.from(files).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-gray-800 rounded text-sm"
                >
                  {getFileIcon(file.name)}
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-slate-500 text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {files && files.length > 0 && (
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} Files
              </>
            )}
          </Button>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700 dark:text-gray-200">
                  {results.total}
                </div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.successful}
                </div>
                <div className="text-xs text-slate-500">Success</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.failed}
                </div>
                <div className="text-xs text-slate-500">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {results.totalChunks}
                </div>
                <div className="text-xs text-slate-500">Chunks</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {results.details.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded border"
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-gray-200 truncate">
                      {result.filename}
                    </p>
                    {result.error && (
                      <p className="text-xs text-red-500 truncate">{result.error}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {result.chunks} chunks
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
