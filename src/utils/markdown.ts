
export const parseMarkdown = (content: string) => {
  return content
    // Headers (h1)
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-4 mb-6 text-foreground">$1</h1>')
    // Headers (h2)
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h2>')
    // Headers (h3)
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-foreground">$1</h3>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">$1</blockquote>')
    // Unordered lists - convert bullet points
    .replace(/^[*-] (.+)$/gm, '<li class="ml-4">$1</li>')
    // Wrap consecutive list items
    .replace(/(<li class="ml-4">.*?<\/li>\s*)+/gs, '<ul class="list-disc ml-6 my-4">$&</ul>')
    // Bold text (**text**)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic text (*text*)
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic">$1</em>')
    // Internal article links - convert /knowledge/slug to proper link with SEO attributes
    .replace(/\[([^\]]+)\]\(\/knowledge\/([^)]+)\)/g, '<a href="/knowledge/$2" class="text-primary underline hover:text-primary/80 font-medium transition-colors" rel="noopener">$1</a>')
    // External links - add target blank and noopener
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">$1</a>')
    // Regular links (fallback)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80">$1</a>')
    // Paragraphs - replace double line breaks
    .replace(/\n\n/g, '</p><p class="mb-4 text-foreground">')
    // Single line breaks
    .replace(/\n/g, '<br />')
    // Wrap in paragraphs
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<h1') || match.startsWith('<h2') || match.startsWith('<h3') || 
          match.startsWith('<blockquote') || match.startsWith('<ul') || 
          match.startsWith('<li') || match.startsWith('<br')) {
        return match;
      }
      return `<p class="mb-4 text-foreground">${match}</p>`;
    })
    // Clean up extra paragraph tags around special elements
    .replace(/<p class="mb-4 text-foreground">(<h[123].*?<\/h[123]>)<\/p>/g, '$1')
    .replace(/<p class="mb-4 text-foreground">(<blockquote.*?<\/blockquote>)<\/p>/g, '$1')
    .replace(/<p class="mb-4 text-foreground">(<ul.*?<\/ul>)<\/p>/gs, '$1')
    // Clean up empty paragraphs
    .replace(/<p class="mb-4 text-foreground"><\/p>/g, '')
    .replace(/<p class="mb-4 text-foreground"><br \/><\/p>/g, '');
};
