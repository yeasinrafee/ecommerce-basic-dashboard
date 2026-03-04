"use client";

import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { IconPhoto } from '@tabler/icons-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomRichTextEditor({ value, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {},
        orderedList: {},
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true, // Useful for quick testing, though not for production
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // For now, we save as HTML to keep it simple for your form
      onChange(editor.getHTML());
    },
    immediatelyRender: false, // Fix SSR hydration error
  });

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Create a local temporary URL
        const url = URL.createObjectURL(file);
        editor?.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  };

  return (
    <div className="prose-container [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_em]:italic [&_.tiptap_del]:line-through">
      <RichTextEditor editor={editor} className="rounded-xl overflow-hidden border">
        <RichTextEditor.Toolbar sticky stickyOffset={0} className="flex flex-wrap gap-1 p-1">
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            {/* Custom Button for Images */}
            <button
              type="button"
              onClick={addImage}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Insert Image"
            >
              <IconPhoto size={18} stroke={1.5} />
            </button>
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
    </div>
  );
}