"use client";

import { useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Shield,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  ClipboardList,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  const userRole = (session.user as any)?.role;
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const navItems = [
    { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
    { href: "/dashboard/reports", label: "Ihbarlar", icon: FileText },
    { href: "/dashboard/form-builder", label: "Ihbar Formu", icon: ClipboardList },
    { href: "/dashboard/team", label: "Ekip", icon: Users },
    { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
  ];

  // Super Admin only items
  if (isSuperAdmin) {
    navItems.push({
      href: "/dashboard/users",
      label: "Kullanicilar",
      icon: UserPlus,
    });
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">EthicAll</span>
          </Link>
          <p className="text-xs text-gray-500 mt-1">
            {(session.user as any)?.organizationName}
          </p>
          {isSuperAdmin && (
            <span className="inline-block mt-1 text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              SUPER ADMIN
            </span>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const isSuperOnly = item.href === "/dashboard/users";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? isSuperOnly
                      ? "bg-purple-50 text-purple-700"
                      : "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isSuperOnly && (
                  <span className="ml-auto text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                    SA
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <div className="px-3 py-2 text-sm text-gray-600 mb-2">
            {session.user?.name}
            <span className="block text-xs text-gray-400">{session.user?.email}</span>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            <LogOut className="h-4 w-4" />
            Cikis Yap
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}
