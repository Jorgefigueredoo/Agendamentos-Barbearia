"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Scissors,
  Calendar,
  Package,
  Clock,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { href: "/admin", label: "Agendamentos", icon: Calendar },
  { href: "/admin/servicos", label: "Serviços", icon: Package },
  { href: "/admin/horarios", label: "Horários", icon: Clock },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/admin/login");
  };

  const isRouteActive = (href: string) => {
    // deixa ativo se estiver exatamente na rota
    if (pathname === href) return true;

    // deixa ativo se estiver em subrota (ex.: /admin/servicos/123)
    if (href !== "/admin" && pathname.startsWith(href)) return true;

    return false;
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-sidebar-foreground">
              Barber Shop
            </h1>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const active = isRouteActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50 transition-colors mb-2"
        >
          Ver Site
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 z-50">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Scissors className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-serif font-bold text-sidebar-foreground">
            Barber Shop
          </span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-sidebar-foreground"
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-14 left-0 bottom-0 w-64 bg-sidebar flex flex-col">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col fixed top-0 left-0 bottom-0">
        <SidebarContent />
      </aside>
    </>
  );
}
