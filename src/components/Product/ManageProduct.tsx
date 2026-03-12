"use client"

import React from "react";
import Table, { type Column } from "@/components/Common/Table";
import CustomButton from "@/components/Common/CustomButton";
import DeleteModal from "@/components/Common/DeleteModal";
import SearchBar from "@/components/FormFields/SearchBar";
import Modal from "@/components/Common/Modal";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Package, Tag, Layers, ImageIcon, Layout, Info, Ruler, Boxes, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePaginatedProducts, useDeleteProduct } from "@/hooks/product.api";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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

  const [viewTarget, setViewTarget] = React.useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const deleteMutation = useDeleteProduct();

  const handleCreate = () => {
    router.push("/dashboard/product/create");
  };

  const handleView = (item: any) => {
    setViewTarget(item);
    setViewModalOpen(true);
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
              <DropdownMenuItem onClick={() => handleView(item)}>View</DropdownMenuItem>
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
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />

      <Modal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title={viewTarget?.name || "Product details"}
        className="w-full max-w-[80dvw] p-0 overflow-hidden"
      >
        {viewTarget ? (
          <div className="flex flex-col h-[80vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {/* Left Column: Image and Basic Info */}
              <div className="md:col-span-1 space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                  {viewTarget.image ? (
                    <Image
                      src={viewTarget.image}
                      alt={viewTarget.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <Badge variant={viewTarget.status === "ACTIVE" ? "default" : "secondary"}>
                      {viewTarget.status}
                    </Badge>
                    <Badge variant={viewTarget.stockStatus === "IN_STOCK" ? "outline" : "destructive"} className="bg-white">
                      {viewTarget.stockStatus.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Base Price</span>
                    <span className="font-medium line-through decoration-muted-foreground/50">${viewTarget.Baseprice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Final Price</span>
                    <span className="text-lg font-bold text-primary">${viewTarget.finalPrice}</span>
                  </div>
                  {viewTarget.discountType !== "NONE" && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm">Discount</span>
                      <span className="text-sm font-medium">
                        {viewTarget.discountType.replace(/_/g, " ")} ({viewTarget.discountValue}
                        {viewTarget.discountType === "PERCENTAGE_DISCOUNT" ? "%" : "$"})
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Stock</span>
                    <span className="font-medium">{viewTarget.stock} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">SKU</span>
                    <span className="font-mono text-xs">{viewTarget.sku || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Tabbed Detailed Info */}
              <div className="md:col-span-2 flex flex-col min-h-0">
                <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-4 h-11">
                    <TabsTrigger value="overview" className="gap-2"><Info className="h-4 w-4" /> Overview</TabsTrigger>
                    <TabsTrigger value="variants" className="gap-2"><Layers className="h-4 w-4" /> Variants</TabsTrigger>
                    <TabsTrigger value="logistics" className="gap-2"><Ruler className="h-4 w-4" /> Shipping</TabsTrigger>
                    <TabsTrigger value="gallery" className="gap-2"><ImageIcon className="h-4 w-4" /> Gallery</TabsTrigger>
                  </TabsList>

                  <ScrollArea className="flex-1 p-1 mt-4 h-[50vh]">
                    <TabsContent value="overview" className="space-y-4 m-0">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                            <Package className="h-3 w-3" /> Brand
                          </label>
                          <p className="text-sm font-medium">{viewTarget.brand?.name || "No Brand"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3 w-3" /> Slug
                          </label>
                          <p className="truncate font-mono text-xs text-muted-foreground">{viewTarget.slug}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                          <Boxes className="h-3 w-3" /> Categories
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {viewTarget.categories?.length > 0 ? (
                            viewTarget.categories.map((c: any) => (
                              <Badge key={c.categoryId} variant="secondary" className="px-2 py-0">
                                {c.category?.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No categories</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                          <Tag className="h-3 w-3" /> Tags
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {viewTarget.tags?.length > 0 ? (
                            viewTarget.tags.map((t: any) => (
                              <Badge key={t.tagId} variant="outline" className="px-2 py-0">
                                {t.tag?.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No tags</span>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                          <Layout className="h-3 w-3" /> Description
                        </label>
                        <div className="prose prose-sm max-w-none text-muted-foreground bg-muted/20 p-4 rounded-md border">
                          <div dangerouslySetInnerHTML={{ __html: viewTarget.description || "No description provided." }} />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="variants" className="m-0 space-y-4">
                      {viewTarget.productVariations?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {viewTarget.productVariations.map((v: any) => (
                            <div key={v.id} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/10">
                              <div className="h-12 w-12 relative rounded overflow-hidden border bg-background shrink-0">
                                {v.galleryImage ? (
                                  <Image src={v.galleryImage} alt="" fill className="object-cover" />
                                ) : (
                                  <div className="flex items-center justify-center h-full"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{v.attribute?.name}: {v.attributeValue}</p>
                                <p className="text-xs text-muted-foreground">Price Adjustment: ${v.price}</p>
                              </div>
                              <Badge variant="outline">ID: {v.id.slice(0, 8)}...</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                          <Layers className="h-8 w-8 mb-2 opacity-50" />
                          <p>No variations for this product</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="logistics" className="m-0 space-y-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2"><Ruler className="h-4 w-4" /> Dimensions</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Length</span>
                              <span className="font-medium font-mono">{viewTarget.length} cm</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Width</span>
                              <span className="font-medium font-mono">{viewTarget.width} cm</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Height</span>
                              <span className="font-medium font-mono">{viewTarget.height} cm</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-primary/80"><Boxes className="h-4 w-4" /> Physical Details</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Weight</span>
                              <span className="font-medium font-mono">{viewTarget.weight} kg</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Volume</span>
                              <span className="font-medium font-mono">{viewTarget.volume?.toLocaleString()} cm³</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><Info className="h-4 w-4" /> Timing</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Created At</p>
                            <p className="text-sm">{new Date(viewTarget.createdAt).toLocaleDateString()} {new Date(viewTarget.createdAt).toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Last Updated</p>
                            <p className="text-sm">{new Date(viewTarget.updatedAt).toLocaleDateString()} {new Date(viewTarget.updatedAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="gallery" className="m-0">
                      {viewTarget.galleryImages?.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {viewTarget.galleryImages.map((url: string, i: number) => (
                            <div key={i} className="group relative aspect-square rounded-md overflow-hidden border bg-muted">
                              <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover transition-transform group-hover:scale-110" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                          <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                          <p>No gallery images uploaded</p>
                        </div>
                      )}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ManageProduct;