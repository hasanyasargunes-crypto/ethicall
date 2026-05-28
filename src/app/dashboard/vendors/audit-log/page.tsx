"use client";

import { useState, useEffect } from "react";
import { ScrollText, User } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  VENDOR_CREATED: "Tedarikçi eklendi",
  VENDOR_UPDATED: "Tedarikçi güncellendi",
  VENDOR_STATUS_CHANGED: "Tedarikçi durumu değişti",
  VENDOR_DELETED: "Tedarikçi silindi",
  SURVEY_ASSIGNED: "Anket atandı",
  SURVEY_COMPLETED: "Anket tamamlandı",
  DOCUMENT_UPLOADED: "Belge yüklendi",
  DOCUMENT_EXPIRED: "Belge süresi doldu",
};

export default function VendorAuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendors/audit-log")
      .then((r) => r.json())
      .then((data) => { setLogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Tedarikçi Denetim Kayıtları</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tedarikçi modülü işlem geçmişi</p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <ScrollText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Henüz kayıt yok</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Tarih</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">İşlem</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Kullanıcı</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {ACTION_LABELS[log.action] || log.action}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                      {log.user ? (
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {log.user.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">Sistem</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">
                      {log.details ? JSON.stringify(log.details).substring(0, 100) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
