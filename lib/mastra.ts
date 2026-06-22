const MASTRA_BASE_URL = process.env.MASTRA_BASE_URL ?? 'http://localhost:4111';

export interface ChatContext {
  university: string;
  className: string;
  program: string;
  persona: string;
}

export interface MastraGenerateResponse {
  text: string;
}

export async function callMastraAgent(
  agentId: string,
  message: string,
  threadId: string,
  context: ChatContext,
): Promise<string> {
  const systemPrefix = `You are ${context.persona}, an AI onboarding assistant for the ${context.program} program. You are currently onboarding a new student for ${context.className} at ${context.university}. Be warm, concise, and professional. Keep responses under 3 sentences unless the student needs more detail. You are speaking aloud — avoid markdown, bullet points, or lists.`;

  const res = await fetch(`${MASTRA_BASE_URL}/api/agents/${agentId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }],
      instructions: systemPrefix,
      threadId,
      resourceId: threadId,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mastra error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as MastraGenerateResponse;
  return data.text;
}
