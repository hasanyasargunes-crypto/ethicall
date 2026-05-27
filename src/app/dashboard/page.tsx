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
  UserCheck,
  Shield,
} from "lucide-react";
import Link from "next/link";

type EthicsStats = {
  total: number;
  newThisMonth: number;
  slaBreaches: number;
  resolutionRate: number;
  byStatus: { status: string; count: number }[];
  byCategory: { category: string; count: number }[];
};

type KVKKStats = {
  total: number;
  newThisMonth: number;
  slaBreaches: number;
  completionRate: number;
  byStatus: { status: string; count: number }[];
  byRight: { rightType: string; count: number }[];
};

const ETHICS_STATUS_LABELS: Record<string, string> = {
  NEW: "Yeni", ACKNOWLEDGED: "Onaylandı", UNDER_REVIEW: "İnceleniyor",
  INVESTIGATING: "Soruşturuluyor", RESOLVED: "Çözüldü", CLOSED: "Kapatıldı", DISMISSED: "Reddedildi",
};
const ETHICS_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500", ACKNOWLEDGED: "bg-amber-500", UNDER_REVIEW: "bg-purple-500",
  INVESTIGATING: "bg-orange-500", RESOLVED: "bg-brand-500", CLOSED: "bg-gray-400", DISMISSED: "bg-red-400",
};
const KVKK_STATUS_LABELS: Record<string, string> = {
  NEW: "Yeni", RECEIVED: "Alındı", IN_REVIEW: "İnceleniyor", INFO_REQUESTED: "Ek Bilgi",
  PARTIALLY_APPROVED: "Kısmen Kabul", APPROVED: "Kabul", REJECTED: "Ret", COMPLETED: "Tamamlandı",
};
const KVKK_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500", RECEIVED: "bg-cyan-500", IN_REVIEW: "bg-purple-500", INFO_REQUESTED: "bg-amber-500",
  PARTIALLY_APPROVED: "bg-teal-500", APPROVED: "bg-emerald-500", REJECTED: "bg-red-400", COMPLETED: "bg-gray-400",
};

const KVKK_RIGHT_SHORT: Record<string, string> = {
  LEARN_IF_PROCESSED: "İşlenip işlenmediğini öğrenme",
  REQUEST_INFO: "Bilgi talep etme",
  LEARN_PURPOSE: "İşlenme amacını öğrenme",
  LEARN_THIRD_PARTIES: "Üçüncü kişileri bilme",
  REQUEST_CORRECTION: "Düzeltme isteme",
  REQUEST_DELETION: "Silme/yok etme isteme",
  NOTIFY_THIRD_PARTIES: "Üçüncü kişilere bildirim",
  OBJECT_AUTOMATED: "Otomatik analize itiraz",
  CLAIM_DAMAGES: "Zarar giderilmesi",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [ethicsStats, setEthicsStats] = useState<EthicsStats | null>(null);
  const [kvkkStats, setKVKKStats] = useState<KVKKStats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setEthicsStats).catch(() => {});
    fetch("/api/kvkk/stats").then((r) => r.json()).then(setKVKKStats).catch(() => {});
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  const isLoading = !ethicsStats && !kvkkStats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
          {greeting()}, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-[15px] mt-1">
          EthicAll platformunuzun genel durumuna buradan göz atabilirsiniz.
        </p>
      </div>

      {/* Ethics Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
            <Shield className="h-4 w-4 text-brand-700" />
          </div>
          <h2 className="text-[18px] font-semibold text-gray-900">Etik İhbar</h2>
          <Link href="/dashboard/reports" className="ml-auto text-[13px] text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            Tümünü Gör <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {ethicsStats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {[
                { label: "Toplam İhbar", value: ethicsStats.total, icon: FileText, iconBg: "bg-brand-50", iconColor: "text-brand-600" },
                { label: "Bu Ay Yeni", value: ethicsStats.newThisMonth, icon: Clock, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
                { label: "SLA Aşımları", value: ethicsStats.slaBreaches, icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-500" },
                { label: "Çözülme Oranı", value: `%${ethicsStats.resolutionRate}`, icon: TrendingUp, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
              ].map((card) => (
                <div key={card.label} className="stat-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[12px] font-medium text-gray-500">{card.label}</p>
                      <p className="text-[24px] font-bold text-gray-900 mt-0.5 tracking-tight">{card.value}</p>
                    </div>
                    <div className={`${card.iconBg} p-2 rounded-xl`}>
                      <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Duruma Göre</h3>
              {ethicsStats.byStatus.length === 0 ? (
                <div className="text-center py-6">
                  <Inbox className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-[12px] text-gray-400">Henüz ihbar yok</p>
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  {ethicsStats.byStatus.map((item) => (
                    <div key={item.status} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <span className={`w-2 h-2 rounded-full ${ETHICS_STATUS_COLORS[item.status] || "bg-gray-300"}`} />
                      <span className="text-[12px] text-gray-600">{ETHICS_STATUS_LABELS[item.status] || item.status}</span>
                      <span className="text-[12px] font-bold text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* KVKK Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-purple-700" />
          </div>
          <h2 className="text-[18px] font-semibold text-gray-900">İlgili Kişi Başvuruları</h2>
          <Link href="/dashboard/kvkk/applications" className="ml-auto text-[13px] text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            Tümünü Gör <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {kvkkStats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {[
                { label: "Toplam Başvuru", value: kvkkStats.total, icon: UserCheck, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
                { label: "Bu Ay Yeni", value: kvkkStats.newThisMonth, icon: Clock, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
                { label: "SLA Aşımları", value: kvkkStats.slaBreaches, icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-500" },
                { label: "Tamamlanma Oranı", value: `%${kvkkStats.completionRate}`, icon: TrendingUp, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
              ].map((card) => (
                <div key={card.label} className="stat-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[12px] font-medium text-gray-500">{card.label}</p>
                      <p className="text-[24px] font-bold text-gray-900 mt-0.5 tracking-tight">{card.value}</p>
                    </div>
                    <div className={`${card.iconBg} p-2 rounded-xl`}>
                      <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Duruma Göre</h3>
                {kvkkStats.byStatus.length === 0 ? (
                  <div className="text-center py-6">
                    <Inbox className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-[12px] text-gray-400">Henüz başvuru yok</p>
                  </div>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    {kvkkStats.byStatus.map((item) => (
                      <div key={item.status} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <span className={`w-2 h-2 rounded-full ${KVKK_STATUS_COLORS[item.status] || "bg-gray-300"}`} />
                        <span className="text-[12px] text-gray-600">{KVKK_STATUS_LABELS[item.status] || item.status}</span>
                        <span className="text-[12px] font-bold text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Hak Türüne Göre</h3>
                {kvkkStats.byRight.length === 0 ? (
                  <div className="text-center py-6">
                    <Inbox className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-[12px] text-gray-400">Henüz başvuru yok</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {kvkkStats.byRight.map((item, i) => (
                      <div key={item.rightType} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 w-4">{i + 1}</span>
                          <span className="text-[12px] text-gray-700">
                            {KVKK_RIGHT_SHORT[item.rightType] || item.rightType}
                          </span>
                        </div>
                        <span className="text-[12px] font-bold text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
