// lib/store.ts
import { QdrantClient } from "@qdrant/js-client-rest";

export type DataSource = {
    id: string;
    type: "text" | "file" | "website";
    name: string;
    source: string;
    createdAt: Date;
};

let store: DataSource[] = [];

/**
 * Save a new data source into memory
 */
export function addSource(source: DataSource) {
    store.push(source);
}

/**
 * List all stored data sources from Qdrant
 */
export async function listSources() {
    try {
        const client = new QdrantClient({ url: "http://localhost:6333" });
        
        // Get collection info to see what sources exist
        const collectionInfo = await client.getCollection("myrag-collection");
        
        if (!collectionInfo) {
            return [];
        }

        // Get all points to extract unique sources
        const scrollResult = await client.scroll("myrag-collection", {
            limit: 10000, // Get all points
            with_payload: true,
            with_vector: false
        });

        // Extract unique sources from metadata
        const sourceMap = new Map<string, { type: string; name: string; createdAt: Date }>();
        
        scrollResult.points.forEach((point: any) => {
            if (point.payload && point.payload.metadata && point.payload.metadata.source) {
                const source = point.payload.metadata.source;
                const type = point.payload.metadata.type || (source.startsWith('http') ? 'website' : source.endsWith('.pdf') || source.endsWith('.txt') || source.endsWith('.csv') ? 'file' : 'text');
                const name = source.includes('/') ? source.split('/').pop() : source;
                
                if (!sourceMap.has(source)) {
                    sourceMap.set(source, {
                        type,
                        name: name || source,
                        createdAt: new Date()
                    });
                }
            }
        });

        // Convert to DataSource format
        return Array.from(sourceMap.entries()).map(([source, info], index) => ({
            id: `source-${index}`,
            type: info.type as "text" | "file" | "website",
            name: info.name,
            source,
            createdAt: info.createdAt
        }));
    } catch (error) {
        console.error("Error listing sources from Qdrant:", error);
        return [];
    }
}

/**
 * Delete a data source by source name from Qdrant
 */
export async function deleteSource(sourceName: string) {
    try {
        const client = new QdrantClient({ url: "http://localhost:6333" });
        
        // Delete all points with the matching source metadata
        await client.delete("myrag-collection", {
            filter: {
                must: [
                    {
                        key: "source",
                        match: {
                            value: sourceName
                        }
                    }
                ]
            }
        });
        
        return true;
    } catch (error) {
        console.error("Error deleting source from Qdrant:", error);
        return false;
    }
}

/**
 * Get all stored sources (for RAG retrieval)
 */
export function getAllSources() {
    return store;
}
