/**
 * TASK 2: Fetch the HTML from the detail pages and save it to the database
 *
 * See database schema: https://dbdiagram.io/d/67bd8a84263d6cf9a05df492
 *
 * 1. Iterate all links in the database
 * 2. Save the HTML from the detail pages to the database
 * 3. Focus on the class .maincontent but also extract the title .contentTitle
 * 4. Save the HTML to "crawl.source" and use turndown to convert the html to markdown. Save the markdown
 *    to "crawl.markdown"
 *
 */

import * as cheerio from 'cheerio'
import { eq, isNotNull } from 'drizzle-orm'
import TurndownService from 'turndown'
import { db } from './db'
import { crawl } from './db/schema'

// Converts html to markdown including all tables.
const turndownService = new TurndownService({
  headingStyle: 'atx',
})

async function fetchAndUpdateUrls() {
  const urls = await db
    .select()
    .from(crawl)
    .where(isNotNull(crawl.url))
    .execute()

  for (const entry of urls) {
    if (entry.url) {
      if (!entry.source) {
        console.log(`Extracting ${entry.url}`)
        try {
          const response = await fetch(entry.url)
          const body = await response.text()
          const $ = cheerio.load(body)

          // TODO: Extract the variables from the HTML
          const mainContent = ''
          const title = ''
          const metaKeywords = ''
          const htmlLang = ''

          let markdownContent = ''
          if (mainContent) {
            markdownContent = turndownService.turndown(mainContent)
          }

          await db
            .update(crawl)
            .set({
              // TODO: Save thhe 5 correct values for the columns
              // using the provided db schema.
            })
            .where(eq(crawl.id, entry.id))
            .execute()
        } catch (error) {
          console.error(`Error fetching or updating ${entry.url}:`, error)
        }
      }
    }
  }
}

fetchAndUpdateUrls().then(() => {
  console.log('URLs fetched and updated')
})
