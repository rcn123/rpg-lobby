'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

export function SafeHTML({ html, className }: SafeHTMLProps) {
  const sanitizedHtml = useMemo(() => {
    if (typeof window === 'undefined') {
      // Server-side: return plain text for SSR
      return html.replace(/<[^>]*>/g, '');
    }

    // Client-side: sanitize HTML
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span', 'div'],
      ALLOWED_ATTR: ['style'],
      ALLOWED_STYLES: ['white-space', 'font-weight', 'font-style', 'text-decoration']
    });
  }, [html]);

  if (typeof window === 'undefined') {
    // Server-side: render as plain text
    return <div className={className}>{sanitizedHtml}</div>;
  }

  // Client-side: render sanitized HTML
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}