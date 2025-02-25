/**
 * TASK 1: Crawl the website https://www.gemeindedavos.ch/wohnen
 *
 * See 01_crawl.png.
 *
 * 1. Iterate the sidebar (red)
 * 2. Collect all links with a topic. (green)
 * 3. Save the links to the database.
 *
 */

import * as cheerio from 'cheerio'
import { eq } from 'drizzle-orm'
import { crawl } from './db/schema'
import { db } from './db'

const initialUrl = 'https://www.gemeindedavos.ch/wohnen'

async function collectUrls(url: string, collectedUrls: string[]) {
  try {
    const response = await fetch(url)
    const body = await response.text()
    const $ = cheerio.load(body)

    // Extract links from div#sidebar__nav and fetch them with cheerio
    const sidebarLinks = $('div#sidebar__nav a')
      .map((_, element) => $(element).attr('href'))
      .get()
    for (const link of sidebarLinks) {
      if (link) {
        const fullLink = new URL(link, initialUrl).href
        try {
          const subPageResponse = await fetch(fullLink)
          const subPageBody = await subPageResponse.text()
          const subpage$ = cheerio.load(subPageBody)

          // Extract links with class icms-link-thema2 from the sidebar pages
          subpage$('a.icms-link-thema2').each((_, subpageElement) => {
            const detailPageLink = $(subpageElement).attr('href')
            if (detailPageLink) {
              collectedUrls.push(new URL(detailPageLink, initialUrl).href)
              console.log('Found link:', detailPageLink)
            }
          })
        } catch (error) {
          console.error(`Error fetching ${link}:`, error)
        }
      }
    }
  } catch (error) {
    console.error(`Error crawling ${url}:`, error)
  }
}

async function saveUrlsToDatabase(urls: string[]) {
  for (const url of urls) {
    const existingUrl = await db
      .select()
      .from(crawl)
      .where(eq(crawl.url, url))
      .execute()

    if (existingUrl.length === 0) {
      await db.insert(crawl).values({ url }).execute()
    }
  }
}

async function main() {
  const collectedUrls: string[] = []
  await collectUrls(initialUrl, collectedUrls)
  await saveUrlsToDatabase(collectedUrls)
  console.log('Crawling urls completed')
}

main()
