"use client";
import * as React from 'react';
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { IconPhoto } from "@tabler/icons-react";
import { toast } from 'react-hot-toast';
import { uploadImageFromEditor, deleteUploadedImage } from '@/lib/uploadImage';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomRichTextEditor({ value, onChange }: EditorProps) {
  const prevImageSrcsRef = React.useRef<Set<string>>(new Set());
  const srcToPublicIdRef = React.useRef<Map<string, string>>(new Map());
  const pendingUploadsRef = React.useRef<Record<string, { promise: Promise<{ url: string; publicId: string | null }>; cancelled: boolean }>>({});

  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {},
        orderedList: {},
      }),
      Underline,
      Highlight,
      Code,
      CodeBlock,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      try {
        const currentSrcs = new Set<string>();
        editor.state.doc.descendants((node: any) => {
          if (node.type.name === 'image' && node.attrs && node.attrs.src) {
            currentSrcs.add(node.attrs.src);
          }
          return true;
        });

        // mark pending uploads cancelled if their temp url no longer exists
        for (const tempUrl of Object.keys(pendingUploadsRef.current)) {
          if (!currentSrcs.has(tempUrl)) {
            pendingUploadsRef.current[tempUrl].cancelled = true;
          }
        }

        // detect removed images and delete their cloud asset (publicId or URL)
        const prev = prevImageSrcsRef.current;
        for (const s of prev) {
          if (!currentSrcs.has(s)) {
            const pid = srcToPublicIdRef.current.get(s);
            // fire and forget: if we have a publicId use it, otherwise send the URL and let server derive the publicId
            void deleteUploadedImage(pid ?? s).catch((err) => console.warn('Failed to cleanup removed editor image', err));
            if (pid) srcToPublicIdRef.current.delete(s);
          }
        }

        prevImageSrcsRef.current = currentSrcs;
      } catch (err) {
        console.warn('Error in editor update handler', err);
      }
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = async (event: any) => {
      const file: File = event.target.files[0];
      if (!file) return;

      // Insert a local preview immediately
      const tempUrl = URL.createObjectURL(file);
      editor?.chain().focus().setImage({ src: tempUrl, alt: file.name }).run();

      // start upload and keep track so we can cleanup if the user removes the temp image
      const uploadPromise = uploadImageFromEditor(file);
      pendingUploadsRef.current[tempUrl] = { promise: uploadPromise, cancelled: false };

      uploadPromise.then((result) => {
        try {
          const uploadedUrl = result.url;
          const publicId = result.publicId ?? null;

          const pending = pendingUploadsRef.current[tempUrl];
          delete pendingUploadsRef.current[tempUrl];

          if (pending && pending.cancelled) {
            // user removed the temp image before upload finished; delete the uploaded asset
            if (publicId) {
              void deleteUploadedImage(publicId).catch((err) => console.warn('Failed to cleanup orphaned upload', err));
            }
            try { URL.revokeObjectURL(tempUrl); } catch (_e) {}
            return;
          }

          // replace any image nodes with the tempUrl to the uploadedUrl
          if (editor) {
            const { state, view } = editor as any;
            const tr = state.tr;
            state.doc.descendants((node: any, pos: number) => {
              if (node.type.name === 'image' && node.attrs && node.attrs.src === tempUrl) {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: uploadedUrl });
              }
            });
            if (tr.docChanged) view.dispatch(tr);
          }

          // map uploaded URL to its publicId for later cleanup
          if (publicId) {
            srcToPublicIdRef.current.set(uploadedUrl, publicId);
          }

          // cleanup temporary object URL
          try { URL.revokeObjectURL(tempUrl); } catch (_e) {}
        } catch (err: any) {
          toast.error(err?.message || 'Image handling failed');
        }
      }).catch((err: any) => {
        // remove temp preview nodes inserted earlier
        if (editor) {
          const { state, view } = editor as any;
          const tr = state.tr;
          const toDelete: number[] = [];
          state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === 'image' && node.attrs && node.attrs.src === tempUrl) {
              toDelete.push(pos);
            }
          });

          // delete from the end to maintain correct positions
          for (let i = toDelete.length - 1; i >= 0; i--) {
            const pos = toDelete[i];
            const node = state.doc.nodeAt(pos);
            if (node) {
              tr.delete(pos, pos + node.nodeSize);
            }
          }

          if (tr.docChanged) view.dispatch(tr);
        }

        try { URL.revokeObjectURL(tempUrl); } catch (_e) {}
        toast.error(err?.message || 'Image upload failed');
      });
    };
    input.click();
  };

  return (
    <div className="prose-container [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_em]:italic [&_.tiptap_del]:line-through">
      <RichTextEditor
        editor={editor}
        className="rounded-xl overflow-hidden border min-h-[300px]"
      >
        <RichTextEditor.Toolbar
          sticky
          stickyOffset={0}
          className="flex flex-wrap gap-1 p-1"
        >
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.Highlight />
            <RichTextEditor.ClearFormatting />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Blockquote />
            <RichTextEditor.Code />
            <RichTextEditor.CodeBlock />
            <RichTextEditor.Hr />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignRight />
            <RichTextEditor.AlignJustify />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
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

        <RichTextEditor.Content className="p-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:max-h-[200px]" />
      </RichTextEditor>
    </div>
  );
}
