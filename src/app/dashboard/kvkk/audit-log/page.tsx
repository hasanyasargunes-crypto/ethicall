"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollText, Inbox } from "lucide-react";

type AuditLog = {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  user: { name: string } | null;
  dataRequest: { id: string; trackingCode: string; applicantName: string; applicantSurname: string } | null;
  createdAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  "data_request.created": "Başvuru oluşturuldu",
  "data_request.updated": "Başvuru güncellendi",
  "data_request.status_changed": "Durum değiştirildi",
  "data_request.assigned": "Atama yapıldı",
  "data_request.response_sent": "Cevap gönderildi",
};

export default function KVKKAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/kvkk/audit-log")
      .then((r) => r.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">KVKK Başvuru Kayıtları</h1>
        <p className="page-subtitle">Tüm başvuru işlemlerinin denetim kaydı</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <Inbox className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Henüz kayıt yok</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <ScrollText className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-gray-900">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                      {log.dataRequest && (
                        <Link
                          href={`/dashboard/kvkk/applications/${log.dataRequest.id}`}
                          className="text-[12px] text-brand-600 hover:text-brand-700 font-mono"
                        >
                          {log.dataRequest.trackingCode}
                        </Link>
                      )}
                    </div>
                    {log.dataRequest && (
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        Başvuran: {log.dataRequest.applicantName} {log.dataRequest.applicantSurname}
                      </p>
                    )}
                    {log.details && (log.details as Record<string, string[]>).changes && (
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        {((log.details as Record<string, string[]>).changes || []).join(", ")}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1">
                      {log.user?.name || "Sistem"} · {new Date(log.createdAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
