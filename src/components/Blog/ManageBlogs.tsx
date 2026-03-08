"use client"

import React from "react"
import Table, { type Column } from "@/components/Common/Table"
import CustomButton from "@/components/Common/CustomButton"
import CreateBlog from "./CreateBlog"
import DeleteModal from "@/components/Common/DeleteModal"
import SearchBar from "@/components/FormFields/SearchBar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

type BlogItem = {
  id: string
  title: string
  author: string
  category: string
  tags: string[]
  createdAt: string
}

const SAMPLE_DATA: BlogItem[] = [
  { id: "1", title: "Introducing Our New Feature", author: "Jane Doe", category: "Release", tags: ["Product", "Release"], createdAt: new Date().toISOString() },
  { id: "2", title: "How to Optimize Performance", author: "John Smith", category: "Tutorial", tags: ["Performance", "Node"], createdAt: new Date().toISOString() },
]

export default function ManageBlogs() {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<BlogItem | null>(null)
  const [page, setPage] = React.useState(1)
  const limit = 10

  const [searchInput, setSearchInput] = React.useState("")
  const [searchTerm, setSearchTerm] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1)
      setSearchTerm(searchInput.trim() || undefined)
    }, 500)
    return () => clearTimeout(handle)
  }, [searchInput])

  const [data] = React.useState<BlogItem[]>(SAMPLE_DATA)

  const [deleteTarget, setDeleteTarget] = React.useState<BlogItem | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)

  const handleCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const handleEdit = (item: BlogItem) => {
    setEditing(item)
    setModalOpen(true)
  }

  const handleDelete = (item: BlogItem) => {
    setDeleteTarget(item)
    setDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    console.log("(UI-only) delete", deleteTarget)
    setDeleteModalOpen(false)
    setDeleteTarget(null)
  }

  const columns = React.useMemo<Column<BlogItem>[]>(
    () => [
      { header: "Title", accessor: "title" },
      { header: "Author", accessor: "author" },
      { header: "Category", accessor: "category" },
      { header: "Tags", cell: (row) => (row.tags && row.tags.length ? row.tags.join(", ") : "-") },
      { header: "Created", accessor: "createdAt", cell: (row) => new Date(row.createdAt).toLocaleString() }
    ],
    []
  )

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium">Manage Blogs</h2>

      <div className="flex items-center justify-between mb-4">
        <SearchBar searchInput={searchInput} setSearchInput={setSearchInput} clearSearch={() => setSearchInput("")} />
        <CustomButton onClick={handleCreate}>Create Blog</CustomButton>
      </div>

      <Table<BlogItem>
        columns={columns}
        data={data}
        rowKey="id"
        pageSize={limit}
        serverSide={false}
        currentPage={page}
        totalItems={data.length}
        onPageChange={setPage}
        renderRowActions={(item) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleEdit(item)}>Edit</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => handleDelete(item)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <CreateBlog open={modalOpen} onOpenChange={setModalOpen} defaultValues={editing ?? undefined} onSave={(v) => { console.log('Saved (UI-only):', v); setModalOpen(false); }} />

      <DeleteModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} title="Confirm deletion" description={deleteTarget ? `Are you sure you want to delete blog "${deleteTarget.title}"? This action cannot be undone.` : undefined} loading={false} onConfirm={confirmDelete} />
    </div>
  )
}