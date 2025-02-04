import {
  pgTable,
  serial,
  text,
  timestamp,
  json,
  uniqueIndex,
  integer,
  vector,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const crawl = pgTable('crawl', {
  id: serial('id').primaryKey(),
  source: text('source'),
  markdown: text('markdown'),
  url: text('url').unique(),
  source_id: text('source_id'),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
  metadata: json('metadata'),
  language: text('language'),
  title: text('title'),
  summary: text('summary'),
  comment: text('comment'),
  og_date: timestamp('og_date', { withTimezone: true }),
})

export const chunk = pgTable('chunks', {
  id: serial('id').primaryKey(),
  content: text('content'),
  crawl_id: integer('crawl_id'),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
  metadata: json('metadata'),
  language: text('language'),
  title: text('title'),
  tokens: integer('tokens'),
  position: integer('position'),
  embedding: vector('embedding', { dimensions: 1536 }),
})
