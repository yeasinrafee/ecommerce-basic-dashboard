import { 
  LuLayoutDashboard, 
  LuBox, 
  LuShoppingCart, 
  LuUsers, 
  LuLayers, 
  LuTicketPercent, 
  LuGlobe, 
  LuTruck,
  LuImage, 
  LuSettings,
  LuList
} from "react-icons/lu";

export interface RouteItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  subItems?: {
    label: string;
    href: string;
    active?: boolean;
  }[];
}

export const routes: RouteItem[] = [
  {
    icon: LuLayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: LuLayoutDashboard,
    label: "Manage Admin",
    href: "/dashboard/admin",
  },
  // --- Products ---
  {
    icon: LuBox,
    label: "Products",
    href: "/dashboard/products",
    subItems: [
      { 
        label: "Create Product", 
        href: "/dashboard/product/create", 
      },
      { 
        label: "Manage Products", 
        href: "/dashboard/products", 
      },
    ],
  },
  // --- Orders ---
  {
    icon: LuShoppingCart,
    label: "Manage Orders",
    href: "/admin/orders",
  },
  // --- Categories ---
  {
    icon: LuLayers,
    label: "Manage Categories",
    href: "",
    subItems: [
      {
        label: "Product Categories",
        href: "/dashboard/categories/product-categories/manage",
      },
        {
          label: "Product Sub-Categories",
          href: "/dashboard/categories/product-subcategories/manage",
        },
      {
        label: "Blog Categories",
        href: "/dashboard/categories/blog-categories/manage",
      },
    ],
  },
  {
    icon: LuList,
    label: "Manage Brands",
    href: "/dashboard/brands/manage",
  },
  {
    icon: LuGlobe,
    label: "Manage Zones",
    href: "/dashboard/zones/manage",
  },
  {
    icon: LuTruck,
    label: "Shipping",
    href: "/dashboard/shipping/manage",
  },
  {
    icon: LuTicketPercent,
    label: "Zone Policies",
    href: "/dashboard/zone-policies",
    subItems: [
      { label: "Create Zone Policy", href: "/dashboard/zone-policies/create" },
      { label: "Manage Zone Policies", href: "/dashboard/zone-policies/manage" },
    ],
  },
  {
    icon: LuTicketPercent,
    label: "Manage Tags",
    href: "/dashboard/tags",
    subItems: [
      {
        label: "Product Tags",
        href: "/dashboard/tags/product-tags/manage",
      },
      {
        label: "Blog Tags",
        href: "/dashboard/tags/blog-tags/manage",
      },
    ],
  },
  {
    icon: LuImage,
    label: "Blogs",
    href: "/dashboard/blog/manage",
    subItems: [
      { label: "Create Blog", href: "/dashboard/blog/create" },
      { label: "Manage Blogs", href: "/dashboard/blog/manage" },
    ],
  },
  {
    icon: LuList,
    label: "Manage Attributes",
    href: "/dashboard/attributes/manage",
  },
  // --- Users ---
  {
    icon: LuUsers,
    label: "Users",
    href: "/admin/users",
    subItems: [
      { 
        label: "Manage Users", 
        href: "/admin/users", 
      },
    ],
  },
  // --- Marketing ---
  {
    icon: LuTicketPercent,
    label: "Promos",
    href: "/admin/promos",
    subItems: [
      { 
        label: "Create Promo", 
        href: "/admin/promos/create", 
      },
      { 
        label: "Manage Promos", 
        href: "/admin/promos", 
      },
    ],
  },
  // --- Web Management ---
  {
    icon: LuGlobe,
    label: "Web Management",
    href: "/admin/web",
    subItems: [
      { 
        label: "Banner Management", 
        href: "/admin/web/banners", 
      },
      { 
        label: "Site Info (Logo, Contact)", 
        href: "/admin/web/info", 
      },
    ],
  },
  {
    icon: LuSettings,
    label: "Settings",
    href: "/admin/settings",
  },
];