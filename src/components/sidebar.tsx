"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Tags,
  Shield,
  Settings,
  Moon,
  Sun,
  LogOut,
  X,
} from "lucide-react";
import { useAppStore, type ActiveView } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const navItems: {
  view: ActiveView;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "transactions", label: "Transaksi", icon: ArrowLeftRight },
  { view: "add-transaction", label: "Tambah Transaksi", icon: PlusCircle },
  { view: "categories", label: "Kategori", icon: Tags },
  { view: "admin", label: "Admin Dashboard", icon: Shield, adminOnly: true },
  { view: "settings", label: "Pengaturan", icon: Settings },
];

export function Sidebar() {
  const { activeView, setActiveView, sidebarOpen, setSidebarOpen } =
    useAppStore();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-50 h-full w-72 flex flex-col lg:hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-black border-r border-white/10"
          >
            <SidebarContent
              activeView={activeView}
              isAdmin={isAdmin}
              initials={initials}
              user={user}
              theme={theme}
              setTheme={setTheme}
              onNavClick={handleNavClick}
              onLogout={logout}
              onClose={() => setSidebarOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - always visible */}
      <aside className="hidden lg:flex lg:relative lg:z-auto lg:h-full lg:w-72 lg:flex-col lg:shrink-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-black border-r border-white/10">
        <SidebarContent
          activeView={activeView}
          isAdmin={isAdmin}
          initials={initials}
          user={user}
          theme={theme}
          setTheme={setTheme}
          onNavClick={handleNavClick}
          onLogout={logout}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>
    </>
  );
}

// Shared sidebar content
function SidebarContent({
  activeView,
  isAdmin,
  initials,
  user,
  theme,
  setTheme,
  onNavClick,
  onLogout,
  onClose,
}: {
  activeView: ActiveView;
  isAdmin: boolean;
  initials: string;
  user: { name?: string; email?: string; role?: string } | null;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  onNavClick: (view: ActiveView) => void;
  onLogout: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Header with logo */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              DirWallet
            </h1>
            <p className="text-[10px] text-emerald-400/80 font-medium uppercase tracking-widest">
              Smart Finance
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/60 hover:text-white hover:bg-white/10 lg:hidden"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Separator className="bg-white/10 mx-4 w-auto" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive = activeView === item.view;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.view}
                onClick={() => onNavClick(item.view)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5",
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
                    isActive
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25"
                      : "bg-white/5 text-white/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <div className="mt-auto">
        <Separator className="bg-white/10 mx-4 w-auto" />

        {/* Dark mode toggle */}
        <div className="px-4 py-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-white/5 px-3"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5">
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </div>
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </Button>
        </div>

        <Separator className="bg-white/10 mx-4 w-auto" />

        {/* User info & logout */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10 border-2 border-emerald-500/30">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-white/40 truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 px-3"
            onClick={onLogout}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </>
  );
}
