"use client"
import React from "react";
import CreateBlog from "@/components/Blog/CreateBlog";
import { useGetBlog } from '@/hooks/blog.api'
import { useSearchParams } from 'next/navigation'

export default function ClientCreateBlog() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') ?? undefined;

  const { data: blog } = useGetBlog(id ?? '');

  const defaultValues = blog
    ? {
        id: blog.id,
        title: blog.title,
        shortDescription: blog.shortDescription,
        content: blog.content,
        author: blog.authorName,
        category: blog.category?.id ?? blog.category,
        tags: blog.tags?.map((bt: any) => (bt?.tag ? bt.tag.id : bt.id)) ?? [],
        image: blog.image ?? undefined,
      }
    : undefined;

  return (
    <div className="p-4 bg-white">
      <CreateBlog asPage defaultValues={defaultValues} />
    </div>
  );
}
