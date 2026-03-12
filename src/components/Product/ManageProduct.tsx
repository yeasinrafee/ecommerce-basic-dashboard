"use client"

import React from "react";
import Table, { type Column } from "@/components/Common/Table";
import CustomButton from "@/components/Common/CustomButton";
import DeleteModal from "@/components/Common/DeleteModal";
import SearchBar from "@/components/FormFields/SearchBar";
// Modal (view) removed — no longer needed
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePaginatedProducts, useDeleteProduct } from "@/hooks/product.api";

const ManageProduct: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [searchInput, setSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput.trim() || undefined);
    }, 500);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { data: paged, isLoading, isError } = usePaginatedProducts(page, limit);

  const products = paged?.data ?? [];
  const total = paged?.meta?.total ?? 0;

  const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const deleteMutation = useDeleteProduct();

  const handleCreate = () => {
    router.push("/dashboard/product/create");
  };

  const handleEdit = (item: any) => {
    router.push(`/dashboard/product/create?id=${item.id}`);
  };

  const handleDelete = (item: any) => {
    setDeleteTarget(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setDeleteTarget(null);
      }
    });
  };

  const columns = React.useMemo<Column<any>[]>(
    () => [
      { header: "Image", cell: (row) => row.image ? <Image src={row.image} alt="" width={60} height={60} className="object-cover size-[60px]" /> : null },
      { header: "Name", accessor: "name" },
      { header: "Brand", cell: (row) => row.brand?.name || "-" },
      { header: "Categories", cell: (row) => {
          if (!row.categories || !row.categories.length) return "-";
          return (
            <div className="truncate w-32">
              {row.categories.map((c: any) => c.category?.name || "").filter((n: string) => !!n).join(" - ")}
            </div>
          );
        }
      },
      { header: "Tags", cell: (row) => {
          if (!row.tags || !row.tags.length) return "-";
          return (
            <div className="truncate w-32">
              {row.tags.map((t: any) => t.tag?.name || "").filter((n: string) => !!n).join(" - ")}
            </div>
          );
        }
      },
      { header: "Discount", cell: (row) => {
          if (row.discountType && row.discountType !== 'NONE') {
            const val = row.discountValue != null ? (row.discountType === 'PERCENTAGE_DISCOUNT' ? `${row.discountValue}%` : `${row.discountValue}`) : '';
            return `${row.discountType.replace(/_/g,' ')} ${val}`.trim();
          }
          return '-';
        }
      },
      { header: "Price", cell: (row) => row.finalPrice != null ? `$${row.finalPrice}` : "-" },
      { header: "Stock", accessor: "stock" },
      { header: "Status", accessor: "status" },
      { header: "Stock Status", accessor: "stockStatus" },
      // { header: "Created", accessor: "createdAt", cell: (row) => new Date(row.createdAt).toLocaleString() }
    ],
    []
  );

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium">Manage Products</h2>

      <div className="flex items-center justify-between mb-4">
        <SearchBar searchInput={searchInput} setSearchInput={setSearchInput} clearSearch={() => setSearchInput("")} />
        <CustomButton onClick={handleCreate}>Create Product</CustomButton>
      </div>

      <Table<any>
        columns={columns}
        data={products}
        rowKey="id"
        pageSize={limit}
        serverSide={true}
        currentPage={page}
        totalItems={total}
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

      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Confirm deletion"
        description={deleteTarget ? `Are you sure you want to delete product "${deleteTarget.name}"? This action cannot be undone.` : undefined}
        loading={(deleteMutation as any).isPending}
        onConfirm={confirmDelete}
      />

      {/* view modal removed */}
    </div>
  );
};

export default ManageProduct;