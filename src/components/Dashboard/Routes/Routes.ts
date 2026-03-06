import { 
  LuLayoutDashboard, 
  LuBox, 
  LuCirclePlus, 
  LuShoppingCart, 
  LuUsers, 
  LuLayers, 
  LuTicketPercent, 
  LuGlobe, 
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
    icon: React.ElementType;
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
        icon: LuCirclePlus,
        label: "Create Product", 
        href: "/dashboard/product/create", 
      },
      { 
        icon: LuList,
        label: "Manage Products", 
        href: "/dashboard/products", 
      },
    ],
  },
  // --- Orders ---
  {
    icon: LuShoppingCart,
    label: "Orders",
    href: "/admin/orders",
    subItems: [
      { 
        icon: LuCirclePlus,
        label: "Create Order", 
        href: "/admin/orders/create", 
      },
      { 
        icon: LuList,
        label: "Manage Orders", 
        href: "/admin/orders", 
      },
    ],
  },
  // --- Categories ---
  {
    icon: LuLayers,
    label: "Manage Categories",
    href: "/dashboard/categories",
  },
  {
    icon: LuList,
    label: "Manage Brands",
    href: "/dashboard/brands/manage",
  },
  {
    icon: LuTicketPercent,
    label: "Manage Tags",
    href: "/dashboard/tags/manage",
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
        icon: LuList,
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
        icon: LuCirclePlus,
        label: "Create Promo", 
        href: "/admin/promos/create", 
      },
      { 
        icon: LuList,
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
        icon: LuImage,
        label: "Banner Management", 
        href: "/admin/web/banners", 
      },
      { 
        icon: LuSettings,
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