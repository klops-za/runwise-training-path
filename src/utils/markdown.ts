
export const parseMarkdown = (content: string) => {
  return content
    // Headers (##)
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h2>')
    // Bold text (**text**)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic text (*text*)
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic">$1</em>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br />')
    // Wrap in paragraphs
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<h2') || match.startsWith('<br')) {
        return match;
      }
      return `<p class="mb-4">${match}</p>`;
    })
    // Clean up extra paragraph tags around headers
    .replace(/<p class="mb-4">(<h2.*?<\/h2>)<\/p>/g, '$1')
    // Clean up empty paragraphs
    .replace(/<p class="mb-4"><\/p>/g, '');
};
