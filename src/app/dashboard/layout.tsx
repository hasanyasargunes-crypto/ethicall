"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  ClipboardList,
  Inbox,
  Building2,
  ScrollText,
  Menu,
  X,
} from "lucide-react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
          <span className="text-sm text-gray-400">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  const userRole = (session.user as any)?.role;
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const userName = session.user?.name || "";
  const userInitials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const mainNav = [
    { href: "/dashboard", label: "Panel", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/inbox", label: "Gelen Kutusu", icon: Inbox },
    { href: "/dashboard/reports", label: "İhbarlar", icon: FileText },
    { href: "/dashboard/form-builder", label: "İhbar Formu", icon: ClipboardList },
    { href: "/dashboard/team", label: "Ekip", icon: Users },
    { href: "/dashboard/audit-log", label: "Denetim Kayıtları", icon: ScrollText },
  ];

  const adminNav = isSuperAdmin
    ? [
        { href: "/dashboard/users", label: "Organizasyonlar", icon: Building2 },
      ]
    : [];

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="min-h-screen flex bg-[#f8f9fa]">
      {/* Mobile Header */}
      <div className="mobile-only fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-40 items-center px-4 gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">E</span>
          </div>
          <span className="font-bold text-[15px] text-gray-900">EthicAll</span>
        </Link>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="mobile-only fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar-drawer w-[240px] bg-white border-r border-gray-100 flex flex-col fixed h-screen z-50"
        style={{
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms ease-in-out",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-[17px] text-gray-900 tracking-tight">
              EthicAll
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="mobile-only p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {mainNav.map((item) => {
            const active = isActive(item.href, (item as any).exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${
                  active ? "sidebar-item-active" : "sidebar-item-inactive"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Admin Section */}
          {adminNav.length > 0 && (
            <>
              <div className="pt-5 pb-2 px-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Yönetim
                </span>
              </div>
              {adminNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-item ${
                      active ? "sidebar-item-active" : "sidebar-item-inactive"
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-100 p-3 space-y-1">
          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className={`sidebar-item ${
              isActive("/dashboard/settings") ? "sidebar-item-active" : "sidebar-item-inactive"
            }`}
          >
            <div className="w-[18px] h-[18px] rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-[9px] font-bold text-brand-700">⚙</span>
            </div>
            <span>Hesap Ayarları</span>
          </Link>

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {(session.user as any)?.organizationName}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-[240px] overflow-auto min-h-screen pt-14 md:pt-0">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}
