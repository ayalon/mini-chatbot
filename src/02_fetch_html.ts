// Iterate all links in the database and save the HTML from the detail pages to the database
// Focus on the class .maincontent but also extract the title .contentTitle
// Save the html to source and use turndown to convert the html to markdown. Save the markdown to markdown

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

          const mainContent = $('.maincontent').html()?.trim()
          const title = $('.contentTitle').text()
          const metaKeywords = $('meta[name="keywords"]').attr('content')
          const htmlLang = $('html').attr('lang')

          let markdownContent = ''
          if (mainContent) {
            markdownContent = turndownService.turndown(mainContent)
          }

          await db
            .update(crawl)
            .set({
              source: mainContent,
              markdown: markdownContent,
              title: title,
              summary: metaKeywords,
              language: htmlLang,
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
