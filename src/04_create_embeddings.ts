/**
 * TASK 4: Generate Embeddings for the chunks
 *
 *   1. Iterate over the chunks in the database
 *   2. Generate embeddings for the content of the chunks using OpenAI API ('text-embedding-3-small')
 *   3. Save the embeddings to the database
 *
 */

import { eq, and, isNotNull, isNull } from 'drizzle-orm'
import { OpenAI } from 'openai'
import { db } from './db'
import { chunk } from './db/schema'

const openAIclient = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
})

async function generateEmbeddings() {
  const chunks = await db
    .select()
    .from(chunk)
    .where(and(isNotNull(chunk.content), isNull(chunk.embedding)))
    .execute()

  for (const chunkEntry of chunks) {
    // TODO: Generate embeddings for the content of the chunks using OpenAI API / 'text-embedding-3-small'
    const embedding = null

    await db
      .update(chunk)
      .set({ embedding: embedding.data[0].embedding })
      .where(eq(chunk.id, chunkEntry.id))
      .execute()
    console.log(
      `Embedding generated and saved for chunk with ID ${chunkEntry.id}`,
    )
  }
}

generateEmbeddings().then(() => {
  console.log('Embeddings generation completed')
})
