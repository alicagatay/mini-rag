/**
 * QDRANT VECTOR DATABASE CLIENT
 *
 * WHAT IS QDRANT?
 * Qdrant is a vector database that stores and searches high-dimensional embeddings.
 * Think of it as a specialized database optimized for "similarity search" rather than
 * exact matches like traditional databases.
 *
 * WHY DO WE NEED IT?
 * When you embed text using OpenAI (convert text to numbers), you get a 512-dimensional
 * vector. Qdrant stores these vectors and can quickly find the most similar ones using
 * mathematical distance calculations (cosine similarity).
 *
 * HOW IT WORKS:
 * 1. You upload vectors with metadata (the actual text, source URL, etc.)
 * 2. When a user asks a question, you convert their question to a vector
 * 3. Qdrant finds the closest matching vectors in the database
 * 4. You use those results as context for your LLM to generate an answer
 *
 * CLOUD vs LOCAL:
 * - Cloud (what we use): Qdrant hosts the database for you at a URL
 * - Local: You can run Qdrant on your machine with Docker
 *
 * Learn more: https://qdrant.tech/documentation/
 */

// Load environment variables when running scripts (Next.js loads them automatically)
if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
  require("dotenv").config();
}

import { QdrantClient } from "@qdrant/js-client-rest";

/**
 * Initialize Qdrant client with cloud credentials.
 *
 * The client connects to your Qdrant cloud instance using:
 * - url: Your unique Qdrant cluster endpoint
 * - apiKey: Authentication key to access your data
 *
 * This client will be used throughout the app to:
 * - Upload embeddings (upsert operation)
 * - Search for similar vectors (search operation)
 * - Manage collections (create, delete)
 */
export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY,
});
