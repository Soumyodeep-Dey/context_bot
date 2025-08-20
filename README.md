# Context Bot (RAG Application)

A Next.js app for Retrieval-Augmented Generation (RAG) using OpenAI, Qdrant, and LangChain. Index and query data from PDFs, websites, and text.

## Features

- Upload and index PDFs, CSVs, and text files
- Index website content and remote PDFs
- Store embeddings in Qdrant (via Docker)
- Chat interface powered by OpenAI (GPT-4o-mini, GPT-4.1-mini)
- Context-aware answers based on your uploaded sources
- Modern UI with Tailwind, Radix, and Lucide icons
- Theme support (light/dark)

## Project Structure

```
app/
  api/                # REST endpoints for chat, file/text/website storage, source listing/deletion
  components/         # UI components (chat window, file upload, etc.)
  lib/                # Utility functions, text splitting, store logic
  public/             # Static assets (SVGs, favicon)
  uploads/            # Uploaded files (created at runtime)
scripts/              # Utility scripts (e.g., test-qdrant.cjs)
```

## Getting Started

1. Start Qdrant (vector DB) via Docker:
   ```bash
   docker-compose up -d
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `POST /api/chat` — Ask questions, get context-aware answers
- `POST /api/store-file` — Upload and index files (PDF, CSV, TXT)
- `POST /api/store-text` — Store raw text
- `POST /api/store-website` — Index website or remote PDF
- `GET /api/list-sources` — List indexed sources
- `POST /api/delete-source` — Delete a source by ID

## Tech Stack

- Next.js, React, TypeScript
- LangChain, OpenAI, Qdrant
- Tailwind CSS, Radix UI, Lucide Icons
- Docker (Qdrant)

---
