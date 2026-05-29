"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Wallet,
  Calendar,
  Bell,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { getPortalLabel, getInitials } from "@/src/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";

const iconMap = {
  LayoutDashboard,
  Users,
  Receipt,
  Wallet,
  Calendar,
  Bell,
  BarChart2,
  Settings,
};

const allNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Students", href: "/students", icon: "Users" },
  { label: "Receipts", href: "/receipts", icon: "Receipt" },
  { label: "Expenses", href: "/expenses", icon: "Wallet" },
  { label: "Events", href: "/events", icon: "Calendar" },
  { label: "Notices", href: "/notices", icon: "Bell" },
  { label: "Reports", href: "/reports", icon: "BarChart2" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

// Girls portal does not have Events or Notices sections
const GIRLS_EXCLUDED = ["/events", "/notices"];

export default function AdminLayout({ children, portal }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile, signOut, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileTimeout, setProfileTimeout] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  // Filter nav items based on portal
  const navItems = allNavItems.filter(
    (item) => portal !== "girls" || !GIRLS_EXCLUDED.includes(item.href)
  );

  // Safety valve: if user exists but profile never arrives within 4s, render anyway
  useEffect(() => {
    if (!user || userProfile) return;
    const t = setTimeout(() => setProfileTimeout(true), 4000);
    return () => clearTimeout(t);
  }, [user, userProfile]);

  // Get current page title from path
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length < 2) return "Dashboard";
    const page = segments[1];
    return page.charAt(0).toUpperCase() + page.slice(1);
  };

  // Build full href with portal prefix
  const getFullHref = (href) => `/${portal}${href}`;

  // Check if nav item is active
  const isActive = (href) => pathname.startsWith(getFullHref(href));

  // Handle sign out
  const handleSignOut = async () => {
    setSignOutDialogOpen(true);
  };

  const confirmSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

 
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || (user && !userProfile && !profileTimeout)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-neutral-600">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:sticky top-0 inset-y-0 left-0 z-50
        w-64 h-screen shrink-0 bg-brand flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <div>
            <span className="inline-block bg-accent text-white text-xs px-2 py-0.5 rounded-full">
              {getPortalLabel(portal)}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <p className="px-4 mb-2 text-[10px] uppercase tracking-wider text-white/40">
            Main Menu
          </p>
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={getFullHref(item.href)}
                    className={`
                      flex items-center gap-2.5 h-10 px-3 rounded-md
                      transition-colors relative
                      ${
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/65 hover:text-white/90 hover:bg-white/5"
                      }
                    `}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-accent rounded-r" />
                    )}
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {getInitials(userProfile?.name || "Admin")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {userProfile?.name || "Admin"}
              </p>
              <p className="text-[11px] text-white/50 truncate">
                {userProfile?.role?.replace("_", " ") || "Administrator"}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-red-300 hover:text-red-100 transition-colors"
          >
            <LogOut size={15} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-[#E8DFD4] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1 text-neutral-900 hover:text-brand"
            >
              <Menu size={22} />
            </button>

            <Link href={getFullHref("/dashboard")} className="flex items-center gap-2.5 pr-4 border-r border-[#E8DFD4]">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E8DFD4] bg-[#FAF6F1]">
                <Image
                  src="/smas_logo.png"
                  alt="SMAS Logo"
                  width={30}
                  height={30}
                  className="h-7 w-7 object-contain"
                  priority
                />
              </span>
              <span className="hidden sm:block font-serif text-base leading-none text-brand">
                Hudaibiyya College
              </span>
            </Link>

            {/* Page Title & Breadcrumb */}
            <div>
              <h1 className="text-lg font-medium text-neutral-900">
                {getPageTitle()}
              </h1>
              <div className="flex items-center gap-1 text-xs text-neutral-600">
                <span>{getPortalLabel(portal)}</span>
                <ChevronRight size={12} />
                <span>{getPageTitle()}</span>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 text-neutral-600 hover:text-brand transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {getInitials(userProfile?.name || "Admin")}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={getFullHref("/settings")}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={getFullHref("/settings")}>Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 bg-background p-4 md:p-6">
          {children}
        </main>
      </div>

      <ConfirmDialog
        open={signOutDialogOpen}
        onOpenChange={setSignOutDialogOpen}
        onConfirm={confirmSignOut}
        title="Sign out?"
        description="You will be signed out of the admin portal."
        confirmLabel="Sign Out"
        variant="danger"
      />
    </div>
  );
}
