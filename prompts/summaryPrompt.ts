export function createSummaryPrompt(noteTitle: string, noteContent: string): string {
  return `You are a concise research assistant. Summarize the following note into 3-5 clear bullet points highlighting key concepts:

Title: ${noteTitle}
Content:
${noteContent}

Summary:`;
}
