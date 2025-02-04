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

      // Create chunks from markdown
      const chunks = await textSplitter.splitText(entry.markdown)
      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i]
        let title = entry.title || null

        // Check for subtitle in the chunk
        const subtitleMatch = chunkContent.match(
          /^#+\s+\[([^\]]+)\]\([^\)]+\)|^#+\s+(.*)$/m,
        )
        if (subtitleMatch) {
          title = subtitleMatch[1] || subtitleMatch[2]
        }

        const tokenCount = countTokens(chunkContent) ?? 0

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
