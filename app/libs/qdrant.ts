// Load environment variables when running scripts (Next.js loads them automatically)
if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
  require("dotenv").config();
}

import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY,
});
