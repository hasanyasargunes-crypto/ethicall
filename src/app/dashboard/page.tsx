"use client";

import { useEffect, useState } from "react";
import { FileText, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const statCards = [
    { label: "Toplam İhbar", value: stats.total, icon: FileText, color: "text-blue-600" },
    { label: "Bu Ay Yeni", value: stats.newThisMonth, icon: Clock, color: "text-green-600" },
    { label: "SLA Aşımları", value: stats.slaBreaches, icon: AlertTriangle, color: "text-red-600" },
    { label: "Çözülme Oranı", value: `%${stats.resolutionRate}`, icon: TrendingUp, color: "text-emerald-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kontrol Paneli</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <card.icon className={`h-10 w-10 ${card.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Duruma Göre Dağılım</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.byStatus.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz ihbar yok</p>
            ) : (
              <div className="space-y-3">
                {stats.byStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="text-sm">{STATUS_LABELS[item.status] || item.status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(item.count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kategoriye Göre Dağılım</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.byCategory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz ihbar yok</p>
            ) : (
              <div className="space-y-3">
                {stats.byCategory.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <span className="text-sm">{item.category}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
