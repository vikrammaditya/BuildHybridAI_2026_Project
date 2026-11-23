export function createSynthesisPrompt(
  notes: Array<{ title: string; content: string }>,
  query?: string,
): string {
  const notesText = notes
    .map((n, i) => `--- Note ${i + 1}: ${n.title} ---\n${n.content}`)
    .join("\n\n");

  return `You are a knowledge synthesis assistant. Analyze and synthesize the following notes${
    query ? ` with focus on: "${query}"` : ""
  }. Identify overarching themes, cross-cutting insights, and actionable conclusions:

${notesText}

Synthesis:`;
}
