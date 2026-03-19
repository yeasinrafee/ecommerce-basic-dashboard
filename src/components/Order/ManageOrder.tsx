"use client"

import React from "react";
import Table, { type Column } from "@/components/Common/Table";
import CustomButton from "@/components/Common/CustomButton";
import SearchBar from "@/components/FormFields/SearchBar";
import { useForm } from "react-hook-form";
import { useOrders, useUpdateOrderStatus, useBulkUpdateOrderStatus } from "@/hooks/order.api";
import type { Order } from "@/hooks/order.api";
import CustomSelect from "@/components/FormFields/CustomSelect";
import CustomCheckbox from "@/components/FormFields/CustomCheckbox";

export default function ManageOrder() {
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

  const { data, isLoading, error } = useOrders({ page, limit, searchTerm });
  const updateStatusMutation = useUpdateOrderStatus();
  const bulkUpdateMutation = useBulkUpdateOrderStatus();

  const items = data?.data ?? [];

  const [optimisticStatus, setOptimisticStatus] = React.useState<Record<string, "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED">>({});
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

  const handleInlineStatusChange = (id: string, status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED") => {
    const prev = items.find((it) => it.id === id)?.orderStatus;
    setOptimisticStatus((s) => ({ ...s, [id]: status }));

    updateStatusMutation.mutate({ id, status }, {
      onError: () => {
        setOptimisticStatus((s) => {
          const copy = { ...s };
          if (prev === undefined) delete copy[id];
          else copy[id] = prev;
          return copy;
        });
      },
      onSuccess: () => {
        setOptimisticStatus((s) => {
          const copy = { ...s };
          delete copy[id];
          return copy;
        });
      }
    });
  };

  const [bulkStatus, setBulkStatus] = React.useState<string>("PENDING");
  const bulkForm = useForm<{ status: string }>({ defaultValues: { status: bulkStatus } });

  React.useEffect(() => {
    bulkForm.reset({ status: bulkStatus });
  }, [bulkStatus]);

  const applyBulkStatus = () => {
    if (selectedIds.length === 0) return;
    const prev: Record<string, any> = {};
    selectedIds.forEach((id) => {
      prev[id] = optimisticStatus[id] ?? items.find((it) => it.id === id)?.orderStatus;
    });

    setOptimisticStatus((s) => {
      const copy = { ...s };
      selectedIds.forEach((id) => (copy[id] = bulkStatus as any));
      return copy;
    });

    bulkUpdateMutation.mutate({ ids: selectedIds, status: bulkStatus }, {
      onSuccess: () => {
        clearSelection();
        setOptimisticStatus((s) => {
          const copy = { ...s };
          selectedIds.forEach((id) => delete copy[id]);
          return copy;
        });
      },
      onError: () => {
        setOptimisticStatus((s) => {
          const copy = { ...s };
          selectedIds.forEach((id) => {
            const p = prev[id];
            if (p === undefined) delete copy[id];
            else copy[id] = p;
          });
          return copy;
        });
      }
    });
  };

  const statusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  const columns = React.useMemo<Column<Order>[]>(
    () => [
      {
        header: (
          <div className="flex items-center justify-center gap-2">
            <CustomCheckbox
              checked={items.length > 0 && items.every((it) => selected[it.id])}
              onCheckedChange={(v) => {
                if (v) selectAllOnPage();
                else clearSelection();
              }}
            />
            <span className="text-sm">Select</span>
          </div>
        ),
        cell: (row) => (
          <CustomCheckbox
            checked={!!selected[row.id]}
            onCheckedChange={(v) => setSelected((s) => ({ ...s, [row.id]: !!v }))}
          />
        ),
        className: "w-12 text-center"
      },
      {
        header: "Order Information",
        cell: (row) => (
          <div className="flex flex-col text-left">
            <span className="font-medium text-sm">Order #{row.id.slice(0, 8)}</span>
            <span className="text-xs text-muted-foreground">{row.customerName}</span>
            <span className="text-xs text-muted-foreground">{row.customerEmail || row.customerPhone}</span>
          </div>
        ),
      },
      {
        header: "Total Amount",
        cell: (row) => (
          <span className="font-semibold">${row.finalAmount.toFixed(2)}</span>
        ),
        align: "center"
      },
      {
        header: "Status",
        cell: (row) => (
          <InlineStatusSelect 
            value={optimisticStatus[row.id] ?? row.orderStatus} 
            onChange={(s) => handleInlineStatusChange(row.id, s as any)} 
            options={statusOptions}
          />
        ),
        align: "center",
        className: "w-48"
      },
      {
        header: "Placed At",
        accessor: "createdAt",
        cell: (row) => new Date(row.createdAt).toLocaleDateString()
      }
    ],
    [items, selected, optimisticStatus]
  );

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium">Manage Orders</h2>

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
            options={statusOptions}
            valueToField={(v) => v}
            fieldToValue={(v) => v}
            onChangeCallback={(v: string) => setBulkStatus(v)}
            placeholder="Bulk status"
            triggerClassName="w-40 min-h-10 bg-background"
          />
          <CustomButton disabled={selectedIds.length === 0} onClick={applyBulkStatus} loading={bulkUpdateMutation.isPending}>Update Status</CustomButton>
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load orders</p>
      ) : (
        <Table<Order>
          columns={columns}
          data={items}
          rowKey="id"
          pageSize={limit}
          serverSide
          currentPage={page}
          totalItems={Number(data?.meta?.total ?? 0)}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function InlineStatusSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  const { control, reset } = useForm<{ status: string }>({ defaultValues: { status: value } });
  const [val, setVal] = React.useState<string>(value);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    reset({ status: value });
    setVal(value);
  }, [value, reset]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (v: string) => {
    setVal(v);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      onChange(v);
      timerRef.current = null;
    }, 500);
  };

  return (
    <CustomSelect
      name={"status"}
      control={control}
      options={options}
      fieldToValue={(v: any) => v ?? ""}
      valueToField={(v: string) => v}
      onChangeCallback={handleChange}
      placeholder="Status"
      triggerClassName="w-32"
    />
  );
}
