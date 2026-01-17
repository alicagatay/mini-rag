/**
 * RAG TEST API ROUTE - Vector Search Demonstration
 *
 * WHAT THIS ENDPOINT DOES:
 * This is a test endpoint that demonstrates the core of RAG: semantic search.
 * Given a user query, it finds the most relevant chunks from your vector database.
 *
 * THE RAG QUERY FLOW:
 * 1. User sends a question ("How do I use React hooks?")
 * 2. Convert question to embedding (512-dimensional vector)
 * 3. Search Qdrant for most similar vectors (cosine similarity)
 * 4. Return the top K results with their metadata and original text
 *
 * WHY THIS IS "SEMANTIC" SEARCH:
 * Traditional search: Keyword matching ("hooks" must appear in text)
 * Semantic search: Meaning matching (finds "state management in React" even without word "hooks")
 *
 * HOW SIMILARITY WORKS:
 * Vectors in high-dimensional space can be compared using cosine similarity:
 * - Close to 1.0 = very similar meaning
 * - Close to 0.0 = unrelated
 * - Close to -1.0 = opposite meaning
 *
 * Example:
 * Query: "React hooks tutorial"
 * Result 1 (score: 0.89): "Learn to use React hooks for state..."
 * Result 2 (score: 0.72): "State management in React components..."
 * Result 3 (score: 0.45): "JavaScript array methods..."
 *
 * WHAT'S NEXT:
 * In a full RAG implementation, you'd take these results and:
 * 1. Extract the text content from each result
 * 2. Combine them into a context prompt
 * 3. Send to an LLM with the user's original question
 * 4. Stream the LLM's response back to the user
 */

import { openaiClient } from "@/app/libs/openai/openai";
import { qdrantClient } from "@/app/libs/qdrant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query, topK } = body;

  // STEP 1: Convert the user's query to an embedding
  //
  // WHY THE SAME MODEL?
  // We MUST use the same embedding model (text-embedding-3-small, 512 dims)
  // that we used to create the vectors in the database. Different models
  // produce incompatible vector spaces (like measuring in meters vs feet).
  //
  // WHAT'S HAPPENING:
  // "How do I use React hooks?" → [0.23, -0.45, 0.67, ...512 numbers]
  const embedding = await openaiClient.embeddings.create({
    model: "text-embedding-3-small",
    dimensions: 512,
    input: query,
  });

  // STEP 2: Search Qdrant for the most similar vectors
  //
  // WHAT QDRANT DOES:
  // 1. Takes your query vector [0.23, -0.45, 0.67, ...]
  // 2. Compares it to ALL vectors in the "articles" collection
  // 3. Calculates cosine similarity for each
  // 4. Returns the top K most similar ones
  //
  // PARAMETERS:
  // - "articles": The collection name (like a table in SQL)
  // - vector: Your query embedding
  // - limit: How many results to return (topK)
  // - with_payload: Include the metadata and original text (not just scores)
  //
  // RESULTS FORMAT:
  // [
  //   {
  //     id: "uuid-here",
  //     score: 0.89,  // Similarity score (0-1, higher = more similar)
  //     payload: {     // Everything we stored during upload
  //       content: "React hooks are...",
  //       author: "Brian Jenney",
  //       title: "Learn React Hooks",
  //       source: "https://medium.com/..."
  //     }
  //   },
  //   ...
  // ]
  const results = await qdrantClient.search("articles", {
    vector: embedding.data[0].embedding,
    limit: topK,
    with_payload: true,
  });

  // Log results for debugging
  // In production, you'd return these to the frontend or pass to an LLM
  console.log(JSON.stringify(results, null, 2));

  // TODO: Return results to client
  // return NextResponse.json({ results });
}
