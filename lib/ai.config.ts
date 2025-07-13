import { openai } from '@ai-sdk/openai'

export const runtime = 'edge'

export const config = {
  runtime,
  provider: openai({
    apiKey: process.env.OPENAI_API_KEY!,
  }),
}
