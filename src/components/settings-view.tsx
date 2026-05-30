"use client";

import { motion } from "framer-motion";
import {
  User,
  Palette,
  Sun,
  Moon,
  Monitor,
  Info,
  Calendar,
  Shield,
  Code2,
  ScrollText as LicenseIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Theme option card
function ThemeOption({
  icon: Icon,
  label,
  themeValue,
  currentTheme,
  onSelect,
}: {
  icon: React.ElementType;
  label: string;
  themeValue: string;
  currentTheme: string;
  onSelect: (value: string) => void;
}) {
  const isActive = currentTheme === themeValue;

  return (
    <button
      type="button"
      onClick={() => onSelect(themeValue)}
      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
        isActive
          ? "border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30"
          : "border-border bg-card hover:border-emerald-300 dark:hover:border-emerald-700"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
          isActive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span
        className={`text-sm font-medium ${
          isActive
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-foreground"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export function SettingsView() {
  const { user } = useAuthStore();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const handleDarkModeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  const handleThemeSelect = (value: string) => {
    setTheme(value);
  };

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format join date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const currentThemeValue = theme || "system";

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Palette className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          Pengaturan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola profil dan preferensi Anda
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm dark:bg-card/80 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">Profil</h3>
            </div>

            <div className="flex items-center gap-4">
              {/* Avatar with gradient */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
                <span className="text-xl font-bold text-white">
                  {user?.name ? getInitials(user.name) : "?"}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-lg font-bold text-foreground truncate">
                  {user?.name || "Pengguna"}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.email || "-"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    className={`text-[10px] px-1.5 py-0 border-0 ${
                      user?.role === "admin"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }`}
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {user?.role === "admin" ? "Admin" : "Pengguna"}
                  </Badge>
                  {user?.createdAt && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Bergabung {formatDate(user.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm dark:bg-card/80">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Palette className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Tampilan
              </h3>
            </div>

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  {isDark ? (
                    <Moon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Sun className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground cursor-pointer">
                    Mode Gelap
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isDark ? "Tampilan gelap aktif" : "Tampilan terang aktif"}
                  </p>
                </div>
              </div>
              <Switch checked={isDark} onCheckedChange={handleDarkModeToggle} />
            </div>

            {/* Theme selector cards */}
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">
                Pilih Tema
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <ThemeOption
                  icon={Sun}
                  label="Terang"
                  themeValue="light"
                  currentTheme={currentThemeValue}
                  onSelect={handleThemeSelect}
                />
                <ThemeOption
                  icon={Moon}
                  label="Gelap"
                  themeValue="dark"
                  currentTheme={currentThemeValue}
                  onSelect={handleThemeSelect}
                />
                <ThemeOption
                  icon={Monitor}
                  label="Sistem"
                  themeValue="system"
                  currentTheme={currentThemeValue}
                  onSelect={handleThemeSelect}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm dark:bg-card/80">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">Tentang</h3>
            </div>

            <div className="space-y-4">
              {/* App Name */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Code2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Nama Aplikasi
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  DirWallet
                </span>
              </div>

              {/* Version */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Versi</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs">
                  v1.0.0
                </Badge>
              </div>

              {/* Built with */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Code2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Dibuat Dengan
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  Next.js 16, TypeScript, Tailwind CSS
                </span>
              </div>

              {/* License */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <LicenseIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Lisensi
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">MIT</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="pb-4 text-center text-xs text-muted-foreground"
      >
        <p>&copy; {new Date().getFullYear()} DirWallet. All rights reserved.</p>
        <p className="mt-1">Built with ❤️ using Next.js &amp; TypeScript</p>
      </motion.div>
    </div>
  );
}
