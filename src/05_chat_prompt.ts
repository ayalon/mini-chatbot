/**
 * TASK 5: Create a Chatbot Prompt
 *
 *  1. Convert the question into vectors
 *  2. Find similar chunks in your database using the cosine similarity
 *  3. Get the chunks and add them as context to the chatbot
 *  4. Create a chatbot client with a prompt that includes the question and the chunks
 *  5. Use the client to generate an answer solely on the context of the question and the chunks
 *
 * ACHIEVEMENT:
 *  Use the search under: https://www.gemeindedavos.ch/suchen
 * - Figure out when the first cheese dairy was founded in Davos
 * - Finde heraus, wann die erste Käserei in Davos gegründet wurde
 *
 * If you fail, try the chatbot and as the question.
 *  - When was the first cheese dairy founded in Davos?
 *  - Wann wurde die erste Käserei in Davos gegründet?
 */

import inquirer from 'inquirer'
import OpenAI from 'openai'
import { cosineDistance, desc, gt, sql, eq } from 'drizzle-orm'
import { db } from './db'
import { blue, green, yellow, cyan, magenta } from 'colorette'
import { chunk, crawl } from './db/schema'

const openAIclient = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
})

const main = async () => {
  while (true) {
    // Prompt the user for the question
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'question',
        message: blue('Please enter your question:'),
      },
    ])
    const question = answers.question
    console.log(green(`Searching for: ${question}`))

    // Get embedding for the question
    const result = await openAIclient.embeddings.create({
      model: 'text-embedding-3-small',
      input: question,
    })

    // Search the chunks with the most similar embeddings
    const question_vector = JSON.stringify(result.data[0].embedding)

    // Use the cosine distance to find the most similar chunks
    const similarity = sql<number>`1 - (${cosineDistance(chunk.embedding, question_vector)})`
    const similarContent = await db
      .select({
        name: chunk.title,
        content: chunk.content,
        similarity,
        url: crawl.url,
      })
      .from(chunk)
      .innerJoin(crawl, eq(chunk.crawl_id, crawl.id))
      .where(gt(similarity, 0.5))
      .orderBy((t) => desc(t.similarity))
      .limit(4)

    console.log(yellow(`Found' ${similarContent.length} matching chunks`))

    // Display the URL and title of the relevant chunks
    similarContent.forEach((c) => {
      console.log(cyan(`Title: ${c.name}, URL: ${c.url}`))
    })

    // Join all the information into one string for the prompt
    const content = similarContent.map((c) => c.content).join('"""\n"""\n')

    // Send the prompt to the chat model
    const completion = await openAIclient.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        {
          role: 'system',
          content: `
You are a helpful assistant and are happy to provide information.
You are primarily programmed to communicate in German. You are only allowed to answer in the language the user used in his question, 
for example you have to answer in English if the question was asked in English even though the provided contexImplementt is always in German.
With the following content (delimited by triple quotes """), answer the question at the end with only the information that comes from this content.
If you are not sure and the answer is not in the content provided, answer with: ‘I don't know how I can help you.’
Don't make up answers! Don't hallucinate!
`,
        },
        {
          role: 'user',
          content: `
Content:
"""
${content}
"""
***
Question: ${question}
***
Answer:
`,
        },
      ],
    })

    console.log(magenta('*** Answer ***'))

    // Output the answer to the console via streaming
    for await (const chunk of completion) {
      process.stdout.write(green(chunk.choices[0]?.delta?.content || ''))
    }

    process.stdout.write('\n')
    console.log(magenta('**************'))

    // Ask if the user wants to ask another question
    const { askAgain } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'askAgain',
        message: blue('Do you want to ask another question?'),
      },
    ])

    if (!askAgain) {
      break
    }
  }

  process.exit(0)
}

main()
