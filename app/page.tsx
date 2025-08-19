import { DataSourceInput } from "@/components/data-source-input"
import { FileUpload } from "@/components/file-upload"
import { WebsiteInput } from "@/components/website-input"
import { RagStore } from "@/components/rag-store"
import { ChatWindow } from "@/components/chat-window"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-700">RAG Application</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Data Input */}
          <div className="space-y-6">
            <DataSourceInput />
            <FileUpload />
            <WebsiteInput />
            <RagStore />
          </div>

          {/* Right Column - Chat */}
          <div className="lg:sticky lg:top-8">
            <ChatWindow />
          </div>
        </div>
      </main>
    </div>
  )
}
