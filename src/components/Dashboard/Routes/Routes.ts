import {
  BarChart3,
  Users,
  Settings,
  FileText,
  Bell,
  Package,
  Folders,
  BookOpen,
  List,
  Box,
} from "lucide-react";

export const routes = () => [
  {
    icon: BarChart3,
    label: "Dashboard",
    href: "/admin",
    active: true,
  },
  {
    icon: Users,
    label: "Students Management",
    href: "/admin/users",
  },
  {
    icon: Users,
    label: "Instructor Management",
    href: "/admin/instructor",
  },
  {
    icon: Folders,
    label: "Category Management",
    href: "/admin/category",
  },
  {
    icon: BookOpen,
    label: "Course Management",
    href: "/admin/course",
  },
  {
    icon: List,
    label: "Playlist Management",
    href: "/admin/play-list",
  },
  {
    icon: Package,
    label: "Module Management",
    href: "/admin/module",
  },
  {
    icon: FileText,
    label: "Lesson Management",
    href: "/admin/lesson",
  },
  {
    icon: Box,
    label: "Order Management",
    href: "/admin/orders",
  },
  {
    icon: Bell,
    label: "Event Management",
    href: "/admin/event",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/admin/settings",
  },

];
