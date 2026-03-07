"use client"

import React from "react"
import Table, { type Column } from "@/components/Common/Table"
import CustomButton from "@/components/Common/CustomButton"
import CreateCategory from "./CreateCategory"
import Modal from "@/components/Common/Modal"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  type Category,
  useCreateCategory,
  useDeleteCategory,
  usePaginatedCategories,
  useUpdateCategory,
} from "@/hooks/category.api"

export default function ManageCategories() {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Category | null>(null)
  const [page, setPage] = React.useState(1)
  const limit = 10

  const categoriesQuery = usePaginatedCategories(page, limit)
  const { data, isLoading, error } = categoriesQuery
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const handleCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const handleEdit = (cat: Category) => {
    setEditing(cat)
    setModalOpen(true)
  }

  const [deleteTarget, setDeleteTarget] = React.useState<Category | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)

  const handleDelete = (cat: Category) => {
    setDeleteTarget(cat)
    setDeleteModalOpen(true)
  }

  const handleSaveCategory = async (payload: { name: string }) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, name: payload.name })
    } else {
      await createMutation.mutateAsync(payload.name)
    }

    setModalOpen(false)
  }

  const columns = React.useMemo<Column<Category>[]>(
    () => [
      {
        header: "Category",
        accessor: "name",
      },
      {
        header: "Products",
        cell: () => "-",
        align: "center",
      },
    ],
    [],
  )

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium">Categories</h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load categories</p>
      ) : (
        <Table<Category>
          columns={columns}
          data={data?.data ?? []}
          rowKey="id"
          pageSize={limit}
          serverSide
          currentPage={page}
          totalItems={data?.meta.total ?? 0}
          onPageChange={setPage}
          toolbar={<CustomButton onClick={handleCreate}>Create Category</CustomButton>}
          renderRowActions={(cat) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleEdit(cat)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDelete(cat)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      )}

      <CreateCategory
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultValues={editing ? { name: editing.name } : undefined}
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSaveCategory}
      />

      <Modal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm deletion"
        description={
          deleteTarget
            ? `Are you sure you want to delete category "${deleteTarget.name}"? This action cannot be undone.`
            : undefined
        }
        footer={
          <div className="flex gap-2">
            <CustomButton
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton
              variant="outline"
              className="text-destructive"
              loading={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
                setDeleteModalOpen(false)
              }}
            >
              Delete
            </CustomButton>
          </div>
        }
      />
    </div>
  )
}