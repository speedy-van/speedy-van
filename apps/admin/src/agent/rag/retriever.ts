import { PrismaClient } from '@prisma/client';
import type { RAGChunk } from '../types';

const prisma = new PrismaClient();

export interface RetrievalOptions {
  k?: number;
  threshold?: number;
  includeMetadata?: boolean;
}

export async function topKFromDB(
  queryVec: number[], 
  options: RetrievalOptions = {}
): Promise<RAGChunk[]> {
  const { k = 5, threshold = 0.7, includeMetadata = true } = options;
  
  try {
    // Validate input
    if (!queryVec || queryVec.length === 0) {
      throw new Error('Query vector cannot be empty');
    }

    if (k <= 0 || k > 100) {
      throw new Error('K must be between 1 and 100');
    }

    // Perform similarity search using cosine distance
    const rows = await prisma.$queryRawUnsafe<Array<{
      id: number;
      doc_id: string;
      chunk: string;
      score: number;
      metadata?: any;
    }>>(
      `SELECT 
        id, 
        doc_id, 
        chunk, 
        (1 - (embedding <=> $1::vector)) AS score,
        metadata
       FROM rag_chunks
       WHERE (1 - (embedding <=> $1::vector)) >= $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      queryVec,
      threshold,
      k
    );

    // Transform to RAGChunk format
    const chunks: RAGChunk[] = rows.map(row => ({
      id: row.id,
      docId: row.doc_id,
      chunk: row.chunk,
      score: row.score,
      metadata: includeMetadata ? row.metadata : undefined,
    }));

    // Log retrieval stats
    console.log(`RAG retrieval: ${chunks.length} chunks found with scores >= ${threshold}`);

    return chunks;

  } catch (error) {
    console.error('RAG retrieval failed:', error);
    
    // Return empty array on error to prevent system failure
    return [];
  }
}

export async function searchByKeywords(
  keywords: string[],
  options: RetrievalOptions = {}
): Promise<RAGChunk[]> {
  const { k = 5, includeMetadata = true } = options;
  
  try {
    if (!keywords || keywords.length === 0) {
      return [];
    }

    // Create a simple text search query
    const searchTerms = keywords.map(term => `%${term}%`).join(' OR ');
    
    const rows = await prisma.$queryRawUnsafe<Array<{
      id: number;
      doc_id: string;
      chunk: string;
      score: number;
      metadata?: any;
    }>>(
      `SELECT 
        id, 
        doc_id, 
        chunk, 
        1.0 AS score,
        metadata
       FROM rag_chunks
       WHERE chunk ILIKE ANY(ARRAY[${keywords.map(() => '?').join(', ')}])
       ORDER BY id DESC
       LIMIT $1`,
      ...keywords.map(term => `%${term}%`),
      k
    );

    const chunks: RAGChunk[] = rows.map(row => ({
      id: row.id,
      docId: row.doc_id,
      chunk: row.chunk,
      score: row.score,
      metadata: includeMetadata ? row.metadata : undefined,
    }));

    return chunks;

  } catch (error) {
    console.error('Keyword search failed:', error);
    return [];
  }
}

export async function getChunkById(id: number): Promise<RAGChunk | null> {
  try {
    const row = await prisma.$queryRawUnsafe<Array<{
      id: number;
      doc_id: string;
      chunk: string;
      metadata?: any;
    }>>(
      'SELECT id, doc_id, chunk, metadata FROM rag_chunks WHERE id = $1',
      id
    );

    if (row.length === 0) {
      return null;
    }

    return {
      id: row[0].id,
      docId: row[0].doc_id,
      chunk: row[0].chunk,
      score: 1.0,
      metadata: row[0].metadata,
    };

  } catch (error) {
    console.error('Failed to get chunk by ID:', error);
    return null;
  }
}


