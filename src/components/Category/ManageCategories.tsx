"use client"

import React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import CustomButton from "@/components/Common/CustomButton"
import CreateCategory from "./CreateCategory"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

type Category = {
  id: string
  name: string
  productCount: number
}

const STATIC_CATEGORIES: Category[] = [
  { id: "1", name: "Electronics", productCount: 42 },
  { id: "2", name: "Apparel", productCount: 18 },
  { id: "3", name: "Home & Garden", productCount: 27 },
]

export default function ManageCategories() {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Category | null>(null)

  const handleCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const handleEdit = (cat: Category) => {
    setEditing(cat)
    setModalOpen(true)
  }

  const handleDelete = (cat: Category) => {
    console.log("delete:", cat)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Categories</h2>
        <CustomButton onClick={handleCreate}>Create Category</CustomButton>
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead>#</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {STATIC_CATEGORIES.map((cat, idx) => (
            <TableRow key={cat.id}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{cat.name}</TableCell>
              <TableCell>{cat.productCount}</TableCell>
              <TableCell>
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
                    <DropdownMenuItem variant="destructive" onClick={() => handleDelete(cat)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateCategory
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultValues={editing ? { name: editing.name } : undefined}
        onSubmit={(data) => console.log("form submit:", data)}
      />
    </div>
  )
}