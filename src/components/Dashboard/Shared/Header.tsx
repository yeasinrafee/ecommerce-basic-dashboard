"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bell,
  ChevronLeft,
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InitialsAvatar from "@/components/Common/InitialsAvatar";
import { Badge } from "@/components/ui/badge";
// import { useTheme } from "next-themes";
// import { useAppSelector } from "@/redux/hooks";
// import { RootState } from "@/redux/store";
// import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { clearAuthCookies } from "@/lib/cookies";
import { useAuthStore } from "@/store/useAuthStore";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;

  className?: string;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

const Header = ({
  onMenuClick,
  showMenuButton = true,
  className,
  mobileOpen = false,
  setMobileOpen,
  collapsed = false,
  setCollapsed,
}: HeaderProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [notificationCount, setNotificationCount] = useState(3);
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);
  const user = useAuthStore((state) => state.user);
  const clearPersisted = () => {
    if (useAuthStore.persist && typeof useAuthStore.persist.clearStorage === 'function') {
      useAuthStore.persist.clearStorage();
    }
  };

  useEffect(() => {
    setInternalCollapsed(collapsed);
  }, [collapsed]);

  const toggleCollapse = () => {
    if (setCollapsed) {
      setCollapsed(!collapsed);
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

//   const toggleTheme = () => {
//     setTheme(theme === "dark" ? "light" : "light");
//   };

//   const handleLogout = () => {
//     Cookies.remove("skhToken");
//     router.push("/");
//   };

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b bg-white dark:bg-black dark:text-white px-6",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className={cn(
            "h-8 w-8 bg-gray-100 text-slate-700 p-0 hidden md:flex cursor-pointer",
            collapsed ? "rotate-180" : ""
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div>
          {/* <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 || crumb.active ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href || crumb.path || "#"}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb> */}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative bg-gray-100 cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[...Array(3)].map((_, i) => (
              <DropdownMenuItem
                key={i}
                className="flex flex-col items-start py-2"
              >
                <div className="font-medium">New order received</div>
                <div className="text-xs text-muted-foreground">
                  Order #{1000 + i} has been placed
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {i + 1} hour{i !== 0 ? "s" : ""} ago
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center font-medium">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className=" bg-gray-100 cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button> */}

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.image || undefined}
                  alt={user?.name ?? "user"}
                />
                <AvatarFallback>
                  <InitialsAvatar
                    name={user?.name}
                    className="w-full h-full"
                  />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name ?? "Unknown User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={"/admin/profile"} className=" flex items-center gap-2">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => {
                clearAuthCookies();
                clearUser();
                clearPersisted();
                router.push('/');
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
