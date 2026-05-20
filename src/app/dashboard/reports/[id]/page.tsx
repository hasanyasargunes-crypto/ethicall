"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Clock, User, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "NEW", label: "Yeni" },
  { value: "ACKNOWLEDGED", label: "Onaylandı" },
  { value: "UNDER_REVIEW", label: "İnceleniyor" },
  { value: "INVESTIGATING", label: "Soruşturuluyor" },
  { value: "RESOLVED", label: "Çözüldü" },
  { value: "CLOSED", label: "Kapatıldı" },
  { value: "DISMISSED", label: "Reddedildi" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Düşük" },
  { value: "MEDIUM", label: "Orta" },
  { value: "HIGH", label: "Yüksek" },
  { value: "URGENT", label: "Acil" },
];

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  ACKNOWLEDGED: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-purple-100 text-purple-700",
  INVESTIGATING: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
  DISMISSED: "bg-red-100 text-red-700",
};

type ReportDetail = {
  id: string;
  trackingCode: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  severity: string;
  category: { name_tr: string; name_en: string };
  assignedTo: { id: string; name: string } | null;
  slaAckDeadline: string;
  slaResDeadline: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  messages: {
    id: string;
    content: string;
    senderType: string;
    sender: { name: string } | null;
    createdAt: string;
  }[];
  auditLogs: {
    id: string;
    action: string;
    details: any;
    user: { name: string } | null;
    createdAt: string;
  }[];
};

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    const res = await fetch(`/api/reports/${id}`);
    if (res.ok) {
      setReport(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => { loadReport(); }, [id]);

  async function updateReport(data: Record<string, string | null>) {
    await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    loadReport();
  }

  async function sendMessage() {
    if (!message.trim()) return;
    await fetch(`/api/reports/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
    setMessage("");
    loadReport();
  }

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const ackDaysLeft = Math.ceil((new Date(report.slaAckDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const resDaysLeft = Math.ceil((new Date(report.slaResDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{report.title}</h1>
            <Badge className={STATUS_COLORS[report.status]}>
              {STATUS_OPTIONS.find((s) => s.value === report.status)?.label}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm">
            {report.trackingCode} &middot; {report.category.name_tr} &middot;{" "}
            {new Date(report.createdAt).toLocaleDateString("tr-TR")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Açıklama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.description}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>Anonim İhbarcı</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mesajlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {report.messages.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Henüz mesaj yok</p>
                )}
                {report.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.senderType === "REPORTER"
                        ? "bg-blue-50 mr-8"
                        : msg.senderType === "SYSTEM"
                        ? "bg-gray-50 text-center text-sm"
                        : "bg-gray-100 ml-8"
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1">
                      {msg.senderType === "REPORTER"
                        ? "Anonim İhbarcı"
                        : msg.senderType === "SYSTEM"
                        ? "Sistem"
                        : msg.sender?.name || "Etik Ekip"}{" "}
                      &middot; {new Date(msg.createdAt).toLocaleString("tr-TR")}
                    </p>
                    <p>{msg.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="İhbarcıya mesaj yazın..."
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!message.trim()} size="icon" className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Yönetim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Durum</label>
                <select
                  value={report.status}
                  onChange={(e) => updateReport({ status: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Öncelik</label>
                <select
                  value={report.priority}
                  onChange={(e) => updateReport({ priority: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                SLA Durumu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Onay SLA</p>
                {report.acknowledgedAt ? (
                  <p className="text-sm text-green-600 font-medium">Onaylandı</p>
                ) : (
                  <p className={`text-sm font-medium ${ackDaysLeft <= 0 ? "text-red-600" : ackDaysLeft <= 3 ? "text-yellow-600" : "text-green-600"}`}>
                    {ackDaysLeft <= 0 ? `${Math.abs(ackDaysLeft)} gün aşım!` : `${ackDaysLeft} gün kaldı`}
                  </p>
                )}
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600">Çözüm SLA</p>
                {report.resolvedAt ? (
                  <p className="text-sm text-green-600 font-medium">Çözüldü</p>
                ) : (
                  <p className={`text-sm font-medium ${resDaysLeft <= 0 ? "text-red-600" : resDaysLeft <= 30 ? "text-yellow-600" : "text-green-600"}`}>
                    {resDaysLeft <= 0 ? `${Math.abs(resDaysLeft)} gün aşım!` : `${resDaysLeft} gün kaldı`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Aktivite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.auditLogs.map((log) => (
                  <div key={log.id} className="text-sm">
                    <p className="text-gray-600">
                      {log.user?.name || "Sistem"} &middot;{" "}
                      <span className="text-gray-400">
                        {new Date(log.createdAt).toLocaleString("tr-TR")}
                      </span>
                    </p>
                    <p className="text-gray-800">
                      {log.action === "report.created" && "İhbar oluşturuldu"}
                      {log.action === "status.changed" && `Durum değiştirildi: ${log.details?.from} → ${log.details?.to}`}
                      {log.action === "report.updated" && "İhbar güncellendi"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
