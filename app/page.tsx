import { DataSourceInput } from "@/components/data-source-input"
import { FileUpload } from "@/components/file-upload"
import { BulkUpload } from "@/components/bulk-upload"
import { WebsiteInput } from "@/components/website-input"
import { RagStore } from "@/components/rag-store"
import { ChatWindow } from "@/components/chat-window"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"   // ✅ Import Footer

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Navigation Bar */}
      <nav className="glass-card border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
                  RAG Assistant
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 dark:text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>System Online</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Data Input */}
          <div className="space-y-6 animate-fade-in">
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <DataSourceInput />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <FileUpload />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <BulkUpload />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <WebsiteInput />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <RagStore />
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:sticky lg:top-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <ChatWindow />
          </div>
        </div>
      </main>

      {/* ✅ Footer */}
      <Footer />
    </div>
  )
}
