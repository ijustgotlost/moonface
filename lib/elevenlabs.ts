import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'EXAVITQu4vr4xnSDxMaL';
const MODEL_ID = 'eleven_turbo_v2_5';

export async function streamTextToSpeech(text: string): Promise<ReadableStream<Uint8Array>> {
  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  const result = await client.textToSpeech.stream(VOICE_ID, {
    text,
    modelId: MODEL_ID,
    voiceSettings: {
      stability: 0.5,
      similarityBoost: 0.75,
    },
  });

  return result as unknown as ReadableStream<Uint8Array>;
}
