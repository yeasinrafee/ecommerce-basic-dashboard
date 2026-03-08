import React from "react"
import CreateBlog from "@/components/Blog/CreateBlog"
import { getBlogById } from "@/data/blog-sample"

type Props = {
  searchParams?: {
    id?: string
  }
}

export default function Page({ searchParams }: Props) {
  const id = searchParams?.id
  const blog = id ? getBlogById(id) : undefined

  const defaultValues = blog
    ? {
        title: blog.title,
        shortDescription: blog.shortDescription,
        content: blog.content,
        author: blog.author,
        category: blog.category,
        tags: blog.tags,
        image: blog.image,
      }
    : undefined

  return (
    <div className="p-4 bg-white">
      <CreateBlog asPage defaultValues={defaultValues} />
    </div>
  )
}