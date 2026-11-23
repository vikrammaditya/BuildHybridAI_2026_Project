export function createActionItemsPrompt(noteTitle: string, noteContent: string): string {
  return `Extract all actionable tasks and to-do items from the following note. Format each item as a checklist item starting with '- [ ]':

Title: ${noteTitle}
Content:
${noteContent}

Action Items:`;
}
