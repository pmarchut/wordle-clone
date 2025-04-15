// netlify/functions/wordlist.ts
import type { Handler } from '@netlify/functions'
import fetch from 'node-fetch'

export const handler: Handler = async () => {
  try {
    const response = await fetch("https://fly.wordfinderapi.com/api/search?length=5&word_sorting=az&group_by_length=true&page_size=99999&dictionary=all_en");
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(data),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching word list', error }),
    }
  }
}
