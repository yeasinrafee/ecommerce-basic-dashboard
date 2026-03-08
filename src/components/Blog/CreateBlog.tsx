"use client"

import React from "react"
import Modal from "@/components/Common/Modal"
import CustomInput from "@/components/FormFields/CustomInput"
import CustomTextArea from "@/components/FormFields/CustomTextArea"
import CustomFileUpload from "@/components/FormFields/CustomFileUpload"
import CustomButton from "@/components/Common/CustomButton"
import CustomRichTextEditor from "@/components/Common/CustomRichTextEditor"
import CustomCheckbox from "@/components/FormFields/CustomCheckbox"
import { useRouter } from "next/navigation"

interface BlogValues {
  title?: string
  shortDescription?: string
  content?: string
  image?: string
  author?: string
  category?: string
  tags?: string[]
}

interface Props {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultValues?: BlogValues
  onSave?: (values: BlogValues) => void
  submitting?: boolean
  asPage?: boolean
}

const SAMPLE_CATEGORIES = ["News", "Tutorial", "Opinion", "Release"]
const SAMPLE_TAGS = ["React", "Node", "Prisma", "Cloud", "UX", "Design"]

export default function CreateBlog({ open, onOpenChange, defaultValues, onSave, submitting = false, asPage = false }: Props) {
  const router = useRouter()
  const [title, setTitle] = React.useState(defaultValues?.title ?? "")
  const [shortDescription, setShortDescription] = React.useState(defaultValues?.shortDescription ?? "")
  const [content, setContent] = React.useState(defaultValues?.content ?? "")
  const [author, setAuthor] = React.useState(defaultValues?.author ?? "")
  const [category, setCategory] = React.useState(defaultValues?.category ?? "")
  const [tags, setTags] = React.useState<string[]>(defaultValues?.tags ?? [])
  const [imageFiles, setImageFiles] = React.useState<any[]>([])

  React.useEffect(() => {
    setTitle(defaultValues?.title ?? "")
    setShortDescription(defaultValues?.shortDescription ?? "")
    setContent(defaultValues?.content ?? "")
    setAuthor(defaultValues?.author ?? "")
    setCategory(defaultValues?.category ?? "")
    setTags(defaultValues?.tags ?? [])
    setImageFiles([])
  }, [defaultValues, open])

  const toggleTag = (t: string) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((p) => p !== t) : [...prev, t]))
  }

  const handleSave = () => {
    const payload: BlogValues = {
      title,
      shortDescription,
      content,
      author,
      category,
      tags,
      image: imageFiles.length ? imageFiles[0].url : defaultValues?.image,
    }
    if (onSave) onSave(payload)
    else console.log("Blog (UI-only) save:", payload)

    if (asPage && !onSave) {
      router.push("/dashboard/blog/manage")
    } else if (!asPage) {
      onOpenChange?.(false)
    }
  }
  const formInner = (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <CustomInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

        <CustomInput label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />

        <CustomTextArea label="Short Description" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="min-h-24" />

        <div>
          <div className="text-sm font-semibold text-slate-700 mb-2">Content</div>
          <CustomRichTextEditor value={content} onChange={setContent} />
        </div>
      </div>

      <div className="md:col-span-1 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Feature Image</label>
          <CustomFileUpload maxFiles={1} onFilesChange={(f) => setImageFiles(f)} />
          {defaultValues?.image && imageFiles.length === 0 && (
            <div className="mt-3">
              <img src={defaultValues.image} alt="preview" className="w-full rounded-md object-cover h-36" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border px-3 py-2">
            <option value="">Select category</option>
            {SAMPLE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Tags</div>
          <div className="flex flex-col gap-2">
            {SAMPLE_TAGS.map((t) => (
              <CustomCheckbox key={t} label={t} checked={tags.includes(t)} onCheckedChange={() => toggleTag(t)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (asPage) {
    return (
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">{defaultValues ? "Edit Blog" : "Create Blog"}</h1>
          <p className="text-sm text-slate-600">{defaultValues ? "Edit the blog post details" : "Create a new blog post"}</p>
        </div>

        {formInner}

        <div className="flex gap-2 mt-6">
          <CustomButton variant="outline" onClick={() => router.push("/dashboard/blog/manage")}>Cancel</CustomButton>
          <CustomButton loading={submitting} onClick={handleSave}>Save Blog</CustomButton>
        </div>
      </div>
    )
  }

  return (
    <Modal
      open={!!open}
      onOpenChange={onOpenChange ?? (() => {})}
      title={defaultValues ? "Edit Blog" : "Create Blog"}
      description={defaultValues ? "Edit the blog post details" : "Create a new blog post"}
      footer={
        <div className="flex gap-2">
          <CustomButton variant="outline" onClick={() => onOpenChange?.(false)}>Cancel</CustomButton>
          <CustomButton loading={submitting} onClick={handleSave}>Save Blog</CustomButton>
        </div>
      }
    >
      {formInner}
    </Modal>
  )
}