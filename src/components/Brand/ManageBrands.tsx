"use client"

import React from "react"
import Table, { type Column } from "@/components/Common/Table"
import CustomButton from "@/components/Common/CustomButton"
import CreateBrand from "./CreateBrand"
import Modal from "@/components/Common/Modal"
import SearchBar from "@/components/FormFields/SearchBar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import * as api from "@/hooks/brand.api"
import type { Brand } from "@/hooks/brand.api"

export default function ManageBrands() {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Brand | null>(null)
  const [page, setPage] = React.useState(1)
  const limit = 10

  // search state
  const [searchInput, setSearchInput] = React.useState("")
  const [searchTerm, setSearchTerm] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1)
      setSearchTerm(searchInput.trim() || undefined)
    }, 500)
    return () => clearTimeout(handle)
  }, [searchInput])

  const brandsQuery = api.usePaginatedBrands(page, limit, searchTerm)
  const { data, isLoading, error } = brandsQuery
  const createMutation = api.useCreateBrand()
  const updateMutation = api.useUpdateBrand()
  const deleteMutation = api.useDeleteBrand()

  const handleCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const handleEdit = (brand: Brand) => {
    setEditing(brand)
    setModalOpen(true)
  }

  const [deleteTarget, setDeleteTarget] = React.useState<Brand | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)

  const handleDelete = (brand: Brand) => {
    setDeleteTarget(brand)
    setDeleteModalOpen(true)
  }

  const handleSaveBrand = async (payload: { name: string }) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, name: payload.name })
      setEditing((prev) => (prev ? { ...prev, name: payload.name } : prev))
    } else {
      await createMutation.mutateAsync(payload.name)
    }

    setModalOpen(false)
  }

  const columns = React.useMemo<Column<Brand>[]>(
    () => [
      {
        header: "Brand",
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
      <h2 className="mb-4 text-lg font-medium">Manage Brands</h2>

      <div className="flex items-center justify-between mb-4">
        <SearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          clearSearch={() => setSearchInput("")}
        />
        <CustomButton onClick={handleCreate}>Create Brand</CustomButton>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load brands</p>
      ) : (
        <Table<Brand>
          columns={columns}
          data={data?.data ?? []}
          rowKey="id"
          pageSize={limit}
          serverSide
          currentPage={page}
          totalItems={data?.meta.total ?? 0}
          onPageChange={setPage}
          renderRowActions={(brand) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleEdit(brand)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDelete(brand)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      )}

      <CreateBrand
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultValues={editing ? { name: editing.name } : undefined}
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSaveBrand}
      />

      <Modal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm deletion"
        description={
          deleteTarget
            ? `Are you sure you want to delete brand "${deleteTarget.name}"? This action cannot be undone.`
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