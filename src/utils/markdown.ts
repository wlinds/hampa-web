// src/utils/markdown.ts

/**
 * Simple Markdown to HTML converter
 * Handles basic markdown syntax commonly used in blog posts
 */
export const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  let html = markdown;

  // Headers (must be first to avoid conflicts)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" loading="lazy" />');

  // Code blocks (before inline code)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Lists (unordered)
  html = html.replace(/^[\s]*[-*+]\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  // Lists (ordered)
  html = html.replace(/^[\s]*\d+\.\s+(.*)$/gm, '<li>$1</li>');
  // Note: This is a simplified approach. In practice, you'd want to be more careful about list nesting.

  // Blockquotes
  html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');

  // Line breaks and paragraphs
  html = html.replace(/\n\n+/g, '</p><p>');
  html = html.replace(/\n/g, '<br />');

  // Wrap in paragraphs if not already wrapped in block elements
  if (!html.startsWith('<h') && !html.startsWith('<p>') && !html.startsWith('<ul>') && !html.startsWith('<ol>') && !html.startsWith('<blockquote>')) {
    html = `<p>${html}</p>`;
  }

  // Clean up multiple consecutive br tags
  html = html.replace(/(<br \/>){3,}/g, '<br /><br />');

  return html;
};

/**
 * Extract plain text from markdown for excerpts
 */
export const markdownToPlainText = (markdown: string): string => {
  if (!markdown) return '';

  let text = markdown;

  // Remove headers
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove bold and italic
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');

  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

  // Remove code blocks and inline code
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove list markers
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove blockquote markers
  text = text.replace(/^> /gm, '');

  // Clean up whitespace
  text = text.replace(/\n+/g, ' ');
  text = text.replace(/\s+/g, ' ');
  text = text.trim();

  return text;
};

/**
 * Generate a reading time estimate based on content
 */
export const calculateReadingTime = (content: string): number => {
  const plainText = markdownToPlainText(content);
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = plainText.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Generate excerpt from content
 */
export const generateExcerpt = (content: string, maxLength: number = 160): string => {
  const plainText = markdownToPlainText(content);
  
  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last complete sentence within the limit
  const truncated = plainText.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSentence > maxLength * 0.8) {
    return plainText.substring(0, lastSentence + 1);
  } else if (lastSpace > maxLength * 0.8) {
    return plainText.substring(0, lastSpace) + '...';
  } else {
    return truncated + '...';
  }
};

/**
 * Validate if a slug is URL-safe
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Sanitize HTML content for safe display
 */
export const sanitizeHtml = (html: string): string => {

  // Remove script tags and event handlers
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/on\w+\s*=\s*["'][^"']*["']/g, '');
  html = html.replace(/javascript:/gi, '');

  return html;
};