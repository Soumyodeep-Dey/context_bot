import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Context Bot | RAG Application",
  description: "A Next.js app for Retrieval-Augmented Generation (RAG) using OpenAI, Qdrant, and LangChain. Index and query data from PDFs, websites, and text.",
  generator: "Soumyodeep Dey",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="bg-slate-50 dark:bg-black min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <main className="flex-1">
            {children}
          </main>
          
        </ThemeProvider>
      </body>
    </html>
  )
}
