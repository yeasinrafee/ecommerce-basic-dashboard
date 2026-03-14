"use client";

import React from "react";
import Table, { type Column } from "@/components/Common/Table";
import CustomButton from "@/components/Common/CustomButton";
import CreatePromo from "./CreatePromo";
import DeleteModal from "@/components/Common/DeleteModal";
import SearchBar from "@/components/FormFields/SearchBar";
import { usePaginatedPromos, useDeletePromo, Promo } from "@/hooks/promo.api";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { LuPlus } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ManagePromo() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Promo | null>(null);
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const [searchInput, setSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setSearchTerm(searchInput || undefined);
      setPage(1);
    }, 500);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { data, isLoading, error } = usePaginatedPromos(page, limit, searchTerm);
  const deleteMutation = useDeletePromo();

  const items = data?.data ?? [];

  const [deleteTarget, setDeleteTarget] = React.useState<Promo | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const handleEdit = (promo: Promo) => {
    setEditing(promo);
    setModalOpen(true);
  };

  const handleDelete = (promo: Promo) => {
    setDeleteTarget(promo);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  const columns = React.useMemo<Column<Promo>[]>(
    () => [
      {
        header: "Promo Code",
        cell: (row) => <span className="font-semibold">{row.code}</span>,
      },
      {
        header: "Discount Type",
        cell: (row) => row.discountType.replace(/_/g, " "),
      },
      {
        header: "Discount Value",
        cell: (row) => row.discountValue,
      },
      {
        header: "Remaining Uses",
        cell: (row) => row.numberOfUses,
        align: "center",
      },
      {
        header: "Start Date",
        cell: (row) => new Date(row.startDate).toLocaleDateString(),
      },
      {
        header: "End Date",
        cell: (row) => new Date(row.endDate).toLocaleDateString(),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Promos</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage your promotional codes</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/promo/create">
            <CustomButton><LuPlus className="w-4 h-4 mr-2 inline-block" />Create Promo</CustomButton>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-4">
        <div className="w-full sm:max-w-md">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchTerm={searchTerm}
            clearSearch={() => {
              setSearchInput("");
              setSearchTerm(undefined);
            }}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            Error loading promos. Please try again.
          </div>
        )}

        <Table<Promo>
          columns={columns}
          data={items}
          rowKey="id"
          pageSize={limit}
          serverSide
          currentPage={page}
          totalItems={data?.meta?.total ?? 0}
          onPageChange={setPage}
          renderRowActions={(promo) => (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => handleEdit(promo)}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(promo)}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </div>

      {modalOpen && (
        <CreatePromo
          open={modalOpen}
          onOpenChange={(v) => {
            setModalOpen(v);
            if (!v) setEditing(null);
          }}
          defaultValues={editing ? {
            id: editing.id,
            code: editing.code,
            discountType: editing.discountType,
            discountValue: editing.discountValue,
            numberOfUses: editing.numberOfUses,
            startDate: editing.startDate,
            endDate: editing.endDate,
            productIds: editing.promoProducts?.map(pp => pp.productId) ?? []
          } : undefined}
        />
      )}

      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Promo"
        description={`Are you sure you want to delete promo code "${deleteTarget?.code}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
