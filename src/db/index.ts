import { config } from 'dotenv'
import { resolve } from 'path'
import { drizzle } from 'drizzle-orm/node-postgres'
config({ path: resolve(__dirname, '../../.env') })
export const db = drizzle(process.env.DATABASE_URL!)
