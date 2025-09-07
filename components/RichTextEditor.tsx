'use client';

import { $getSelection, $createParagraphNode, ParagraphNode } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $setBlocksType, $patchStyleText } from '@lexical/selection';
import { $createHeadingNode, HeadingNode, HeadingTagType } from '@lexical/rich-text';
import { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [blockType] = useState('paragraph');

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatParagraph = () => {
    if (blockType !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatBold = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          'font-weight': 'bold',
        });
      }
    });
  };

  const formatItalic = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          'font-style': 'italic',
        });
      }
    });
  };

  const formatUnderline = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          'text-decoration': 'underline',
        });
      }
    });
  };

  return (
    <div className="border border-gray-300 dark:border-slate-600 border-b-0 rounded-t-lg bg-gray-50 dark:bg-slate-700 p-2 flex flex-wrap gap-1">
      <button
        type="button"
        onClick={formatBold}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={formatItalic}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={formatUnderline}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        title="Underline"
      >
        <u>U</u>
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-1"></div>
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'paragraph') {
            formatParagraph();
          } else {
            formatHeading(value as HeadingTagType);
          }
        }}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        title="Format"
        value={blockType}
      >
        <option value="paragraph">Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>
    </div>
  );
}

export function RichTextEditor({ 
  onChange, 
  placeholder = 'Enter description...',
  height = 300,
  className = ''
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: 'RichTextEditor',
    theme: {
      root: 'p-0',
      paragraph: 'mb-2',
      heading: {
        h1: 'text-3xl font-bold mb-4',
        h2: 'text-2xl font-semibold mb-3',
        h3: 'text-xl font-semibold mb-2',
      },
    },
    nodes: [
      HeadingNode,
      ParagraphNode,
    ],
    onError: (error: Error) => {
      // Handle Lexical errors silently in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Lexical error:', error);
      }
    },
  };

  return (
    <div className={className}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white min-h-[200px] outline-none"
                style={{ height: `${height}px` }}
                placeholder={
                  <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                    {placeholder}
                  </div>
                }
              />
            }
          />
          <OnChangePlugin
            onChange={(editorState, editor) => {
              editorState.read(() => {
                const htmlString = $generateHtmlFromNodes(editor, null);
                onChange(htmlString);
              });
            }}
          />
          <HistoryPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
}
