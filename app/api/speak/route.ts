import { NextRequest } from 'next/server';
import { streamTextToSpeech } from '@/lib/elevenlabs';

interface SpeakRequestBody {
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SpeakRequestBody;
    const { text } = body;

    if (!text) {
      return new Response('text is required', { status: 400 });
    }

    const audioStream = await streamTextToSpeech(text);

    return new Response(audioStream as ReadableStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(message, { status: 502 });
  }
}
