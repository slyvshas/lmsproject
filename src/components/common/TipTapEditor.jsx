import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

const MenuButton = ({ onClick, isActive, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      padding: '8px 12px',
      margin: '2px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      backgroundColor: isActive ? '#6366f1' : 'rgba(255,255,255,0.1)',
      color: isActive ? '#fff' : '#e2e8f0',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '36px'
    }}
  >
    {children}
  </button>
);

const Divider = () => (
  <div style={{ 
    width: '1px', 
    height: '24px', 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    margin: '0 8px',
    alignSelf: 'center'
  }} />
);

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '2px',
      padding: '12px 16px',
      backgroundColor: 'rgba(20, 20, 45, 0.9)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px 12px 0 0'
    }}>
      {/* Text Formatting */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <s>S</s>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        {'</>'}
      </MenuButton>

      <Divider />

      {/* Headings */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        H1
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        H2
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        H3
      </MenuButton>

      <Divider />

      {/* Lists */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        • List
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        1. List
      </MenuButton>

      <Divider />

      {/* Blocks */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        " Quote
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        {'{ }'}
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        isActive={false}
        title="Horizontal Rule"
      >
        ―
      </MenuButton>

      <Divider />

      {/* Links & Media */}
      <MenuButton
        onClick={addLink}
        isActive={editor.isActive('link')}
        title="Insert Link"
      >
        🔗
      </MenuButton>
      <MenuButton
        onClick={addImage}
        isActive={false}
        title="Insert Image"
      >
        🖼️
      </MenuButton>

      <Divider />

      {/* Undo/Redo */}
      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        isActive={false}
        title="Undo (Ctrl+Z)"
      >
        ↶
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        isActive={false}
        title="Redo (Ctrl+Y)"
      >
        ↷
      </MenuButton>

      <Divider />

      {/* Clear */}
      <MenuButton
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        isActive={false}
        title="Clear Formatting"
      >
        ✕
      </MenuButton>
    </div>
  );
};

const TipTapEditor = ({ content, onChange, placeholder = 'Start writing your article...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 350px;'
      }
    }
  });

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: 'rgba(15, 15, 35, 0.8)'
    }}>
      <MenuBar editor={editor} />
      <div style={{ padding: '20px' }}>
        <EditorContent editor={editor} />
      </div>
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 350px;
          color: #e2e8f0;
          font-size: 16px;
          line-height: 1.8;
        }
        .ProseMirror p {
          margin: 0 0 1em 0;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: 800;
          color: #fff;
          margin: 1.5em 0 0.5em 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 700;
          color: #fff;
          margin: 1.3em 0 0.5em 0;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: 600;
          color: #fff;
          margin: 1.2em 0 0.5em 0;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        .ProseMirror li {
          margin: 0.5em 0;
        }
        .ProseMirror li p {
          margin: 0;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 1em;
          margin: 1.5em 0;
          color: #a5b4fc;
          font-style: italic;
          background: rgba(99, 102, 241, 0.1);
          padding: 1em;
          border-radius: 0 8px 8px 0;
        }
        .ProseMirror code {
          background: rgba(99, 102, 241, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Fira Code', 'Monaco', monospace;
          font-size: 0.9em;
          color: #c4b5fd;
        }
        .ProseMirror pre {
          background: rgba(0, 0, 0, 0.4);
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1em 0;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
          color: #e2e8f0;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid rgba(255,255,255,0.1);
          margin: 2em 0;
        }
        .ProseMirror .editor-link {
          color: #818cf8;
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror .editor-link:hover {
          color: #a5b4fc;
        }
        .ProseMirror .editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
          display: block;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255,255,255,0.3);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default TipTapEditor;
