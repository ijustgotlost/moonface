import { NextRequest, NextResponse } from 'next/server';
import { callMastraAgent } from '@/lib/mastra';
import type { ChatContext } from '@/lib/mastra';

interface ChatRequestBody {
  message: string;
  threadId: string;
  context: ChatContext;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { message, threadId, context } = body;

    if (!message || !threadId) {
      return NextResponse.json({ error: 'message and threadId are required' }, { status: 400 });
    }

    const response = await callMastraAgent('stage-0-welcome-agent', message, threadId, context);
    return NextResponse.json({ response });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
