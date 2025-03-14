# Workshop: Building a basic AI supported search / chatbot

## Introduction

In this workshop in the Drupal Mountain Camp 2025
(https://drupalmountaincamp.ch/schedule-2025), you will learn how to build the
most basic AI supported search / chatbot. We will crawl a bunch of pages and
then build a small chatbot against its content.

You will learn the most important technical terms like Retrieval-Augmented
Generation (RAG), vectorization, chunking and learn more about using contexts
and writing meaningful prompts.

I will give a short introduction and explain the basics about how AI search /
chatbots work. Then we will build a small chatbot during the talk using
TypeScript and a bunch of libraries. There will be a public repo and all
participants will be able to follow and try it out. To sum up, I will talk about
the challenges and pitfalls we faced in the last two year when building large AI
based chatbots and searches like Alva, the AI search for Kanton Basel Stadt:
https://www.bs.ch/alva

## Presentation

https://docs.google.com/presentation/d/1lc6Au1aaTBPv-r2Qro6KSyIqCtJVSKfQT1Trk7wQ5Sk/edit#slide=id.g2b37b16f1cf_0_3

## Setup the project using gitpod (needs a github account)

Open the URL in the browser and start coding:

https://gitpod.io/new/#https://github.com/ayalon/mini-chatbot

## Setup the project locally

### Clone the repository

```bash
git clone git@github.com:ayalon/mini-chatbot.git
cd mini-chatbot
```

### Install dependencies

```bash
npm install
```

### Start postgres database using docker compose

```bash
docker compose up -d
```

The database will be available at `localhost:5432` with the following
credentials: `postgres`/`postgres`

### Import the database schema

```bash
cp .env.example .env
npx drizzle-kit migrate
```

## Implement the chatbot

### Follow the 5 steps

Head over to the `src` folder and start implementing the 5 steps:

1. Crawl the pages:`npx tsx src/01_crawl.ts`
2. Fetch the HTML content: `npx tsx src/02_fetch_html.ts`
3. Chunk the pages: `npx tsx src/03_chunking.ts`
4. Create the embeddings: `npx tsx src/04_create_embeddings.ts`
5. Build the chatbot: `npm run chat`

### Helpers

Create DB Dump

```bash
docker exec mini-chatbot-db-1 pg_dump -h localhost -p 5432 -d mini_chatbot -U postgres -s -F p -E UTF-8 > dump.sql
```
