// lib/store.ts

export type DataSource = {
    id: string;
    type: "text" | "file" | "website";
    content: string;
    embedding: number[];
};

let store: DataSource[] = [];

/**
 * Save a new data source into memory
 */
export function addSource(source: DataSource) {
    store.push(source);
}

/**
 * List all stored data sources
 */
export function listSources() {
    return store;
}

/**
 * Delete a data source by ID
 */
export function deleteSource(id: string) {
    store = store.filter((s) => s.id !== id);
}

/**
 * Get all stored sources (for RAG retrieval)
 */
export function getAllSources() {
    return store;
}
