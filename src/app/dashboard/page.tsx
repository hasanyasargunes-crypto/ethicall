"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import Link from "next/link";

type Stats = {
  total: number;
  newThisMonth: number;
  slaBreaches: number;
  resolutionRate: number;
  byStatus: { status: string; count: number }[];
  byCategory: { category: string; count: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Yeni",
  ACKNOWLEDGED: "Onaylandı",
  UNDER_REVIEW: "İnceleniyor",
  INVESTIGATING: "Soruşturuluyor",
  RESOLVED: "Çözüldü",
  CLOSED: "Kapatıldı",
  DISMISSED: "Reddedildi",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500",
  ACKNOWLEDGED: "bg-amber-500",
  UNDER_REVIEW: "bg-purple-500",
  INVESTIGATING: "bg-orange-500",
  RESOLVED: "bg-brand-500",
  CLOSED: "bg-gray-400",
  DISMISSED: "bg-red-400",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Toplam İhbar",
      value: stats.total,
      icon: FileText,
      iconBg: "bg-brand-50",
      iconColor: "text-brand-600",
      change: null,
    },
    {
      label: "Bu Ay Yeni",
      value: stats.newThisMonth,
      icon: Clock,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      change: null,
    },
    {
      label: "SLA Aşımları",
      value: stats.slaBreaches,
      icon: AlertTriangle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      change: null,
    },
    {
      label: "Çözülme Oranı",
      value: `%${stats.resolutionRate}`,
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      change: null,
    },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
          {greeting()}, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-[15px] mt-1">
          Etik ihbar sisteminizin genel durumuna buradan göz atabilirsiniz.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-gray-500">
                  {card.label}
                </p>
                <p className="text-[28px] font-bold text-gray-900 mt-1 tracking-tight">
                  {card.value}
                </p>
              </div>
              <div
                className={`${card.iconBg} p-2.5 rounded-xl`}
              >
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Duruma Göre Dağılım</h3>
            <Link
              href="/dashboard/reports"
              className="text-[13px] text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              Tümünü Gör <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {stats.byStatus.length === 0 ? (
            <div className="text-center py-10">
              <Inbox className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Henüz ihbar yok</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {stats.byStatus.map((item) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      STATUS_COLORS[item.status] || "bg-gray-300"
                    }`}
                  />
                  <span className="text-[13px] text-gray-600 flex-1">
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                  <div className="w-28 bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`${
                        STATUS_COLORS[item.status] || "bg-gray-300"
                      } h-1.5 rounded-full transition-all`}
                      style={{
                        width: `${Math.max(
                          (item.count / stats.total) * 100,
                          4
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-900 w-6 text-right">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">Kategoriye Göre Dağılım</h3>
          </div>
          {stats.byCategory.length === 0 ? (
            <div className="text-center py-10">
              <Inbox className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Henüz ihbar yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.byCategory.map((item, i) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-gray-400 w-5">
                      {i + 1}
                    </span>
                    <span className="text-[13px] text-gray-700">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold text-gray-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
