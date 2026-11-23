export function createTaggingPrompt(noteContent: string): string {
  return `Extract 3 to 6 lowercase single-word topic tags or keywords from this text. Output only a comma-separated list of tags without punctuation or markdown:

Content:
${noteContent}

Tags:`;
}
