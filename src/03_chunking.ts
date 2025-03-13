/**
 * TASK 3: Chunk the markdown content into smaller pieces
 *
 *   1. Iterate over the markdown content in the database
 *   2. Split the content into smaller chunks using the RecursiveCharacterTextSplitter
 *   3. Try to identify subtitles in the chunks
 *   4. Use the GPT-4 tokenizer to count the tokens in each chunk
 *   5. Save the chunks to the database
 *
 */

import { isNotNull, eq } from 'drizzle-orm'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { db } from './db'
import { crawl, chunk } from './db/schema'
import tokenizer_4_0 from 'gpt-tokenizer/model/gpt-4o'

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 8000,
  chunkOverlap: 300,
})

const countTokens = (content: string): number => {
  return tokenizer_4_0.encode(content).length
}

async function processMarkdown() {
  const entries = await db
    .select()
    .from(crawl)
    .where(isNotNull(crawl.markdown))
    .execute()

  for (const entry of entries) {
    // Check if chunks already exist for the given crawl_id
    const existingChunks = await db
      .select()
      .from(chunk)
      .where(eq(chunk.crawl_id, entry.id))
      .execute()

    if (existingChunks.length > 0) {
      console.log(`Chunks already exist for crawl_id ${entry.id}. Skipping.`)
      continue // Skip processing if chunks already exist
    }

    if (entry.markdown) {
      console.log(`Processing entry with ID ${entry.id}`)

      // TODO: Get the chunks using the text splitter
      const chunks = 'todo'
      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i]

        // Use the page title as the default chunk title
        let title = entry.title || null

        // TODO: Try to identify subtitles in the chunks

        // Use the GPT-4 tokenizer to count the tokens in each chunk
        const tokenCount = countTokens(chunkContent) ?? 0

        // Insert the chunk into the database
        await db
          .insert(chunk)
          .values({
            crawl_id: entry.id,
            content: chunkContent,
            position: i + 1,
            title: title,
            tokens: tokenCount,
          })
          .execute()
      }
    }
  }
}

processMarkdown().then(() => {
  console.log('Markdown processing completed')
})
