"use client"

import React from "react";
import Table, { type Column } from "@/components/Common/Table";
import CustomButton from "@/components/Common/CustomButton";
import CreateAdmin from "./CreateAdmin";
import Modal from "@/components/Common/Modal";
import SearchBar from "@/components/FormFields/SearchBar";
import { useForm } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { usePaginatedAdmins, useUpdateAdmin, useDeleteAdmin, useBulkUpdateAdminStatus } from "@/hooks/admin.api";
import type { Admin } from "@/hooks/admin.api";
import CustomSelect from "@/components/FormFields/CustomSelect";

export default function ManageAdmin() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Admin | null>(null);
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

  const { data, isLoading, error } = usePaginatedAdmins(page, limit, searchTerm);
  const updateMutation = useUpdateAdmin();
  const deleteMutation = useDeleteAdmin();
  const bulkUpdateMutation = useBulkUpdateAdminStatus();

  const items = data?.data ?? [];

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const selectedIds = React.useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  const toggleSelect = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const selectAllOnPage = () => {
    const newSel: Record<string, boolean> = { ...selected };
    items.forEach((it) => {
      newSel[it.id] = true;
    });
    setSelected(newSel);
  };

  const clearSelection = () => setSelected({});

  const handleEdit = (admin: Admin) => {
    setEditing(admin);
    setModalOpen(true);
  };

  const handleDelete = (admin: Admin) => {
    if (!confirm(`Delete admin ${admin.name}?`)) return;
    deleteMutation.mutate(admin.id);
  };

  const handleInlineStatusChange = (id: string, status: "ACTIVE" | "INACTIVE") => {
    updateMutation.mutate({ id, payload: { status } });
  };

  const [bulkStatus, setBulkStatus] = React.useState<string>("ACTIVE");
  const bulkForm = useForm<{ status: string }>({ defaultValues: { status: bulkStatus } });

  React.useEffect(() => {
    bulkForm.reset({ status: bulkStatus });
  }, [bulkStatus]);

  const applyBulkStatus = () => {
    if (selectedIds.length === 0) return;
    bulkUpdateMutation.mutate({ ids: selectedIds, status: bulkStatus }, {
      onSuccess: () => clearSelection()
    });
  };

  const columns = React.useMemo<Column<Admin>[]>(
    () => [
      {
        header: (
          <input
            type="checkbox"
            checked={items.length > 0 && items.every((it) => selected[it.id])}
            onChange={(e) => {
              if (e.target.checked) selectAllOnPage();
              else clearSelection();
            }}
          />
        ),
        cell: (row) => (
          <input
            type="checkbox"
            checked={!!selected[row.id]}
            onChange={() => toggleSelect(row.id)}
          />
        ),
        className: "w-12 text-center"
      },
      {
        header: "Name",
        accessor: "name",
      },
      {
        header: "Email",
        cell: (row) => row.user?.email ?? "-",
      },
      {
        header: "Status",
        cell: (row) => (
          <InlineStatusSelect value={row.status} onChange={(s) => handleInlineStatusChange(row.id, s as "ACTIVE" | "INACTIVE")} />
        ),
        align: "center",
        className: "w-48"
      },
      {
        header: "Created",
        accessor: "createdAt",
        cell: (row) => new Date(row.createdAt).toLocaleString()
      }
    ],
    [items, selected]
  );

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium">Manage Admins</h2>

      <div className="flex items-center justify-between mb-4">
        <SearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          clearSearch={() => setSearchInput("")}
        />

        <div className="flex items-center gap-2">
          <CustomSelect
            name="status"
            control={bulkForm.control}
            options={[{ label: "Active", value: "ACTIVE" }, { label: "Inactive", value: "INACTIVE" }]}
            valueToField={(v) => v}
            fieldToValue={(v) => v}
            onChangeCallback={(v: string) => setBulkStatus(v)}
            placeholder="Bulk status"
            triggerClassName="w-40"
          />
          <CustomButton onClick={applyBulkStatus} loading={bulkUpdateMutation.isPending}>Update Status</CustomButton>
          <CustomButton onClick={() => { setEditing(null); setModalOpen(true); }}>Create Admin</CustomButton>
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load admins</p>
      ) : (
        <Table<Admin>
          columns={columns}
          data={items}
          rowKey="id"
          pageSize={limit}
          serverSide
          currentPage={page}
          totalItems={data?.meta.total ?? 0}
          onPageChange={setPage}
          renderRowActions={(admin) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleEdit(admin)}>Edit</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => handleDelete(admin)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      )}

      <CreateAdmin open={modalOpen} onOpenChange={setModalOpen} defaultValues={editing ? { id: editing.id, name: editing.name, email: editing.user?.email } : undefined} />
    </div>
  );
}

function InlineStatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // lightweight wrapper to use CustomSelect via a small form control
  const { control, reset } = useForm<{ status: string }>({ defaultValues: { status: value } });

  React.useEffect(() => {
    reset({ status: value });
  }, [value, reset]);

  return (
    <CustomSelect
      name={"status"}
      control={control}
      options={[{ label: "Active", value: "ACTIVE" }, { label: "Inactive", value: "INACTIVE" }]}
      fieldToValue={(v: any) => v ?? ""}
      valueToField={(v: string) => v}
      onChangeCallback={(v: string) => onChange(v)}
      placeholder="Status"
      triggerClassName="w-32"
    />
  );
}