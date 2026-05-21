"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Clock,
  Plus,
  Check,
  AlertCircle,
} from "lucide-react";

const ROLES = [
  { value: "REVIEWER", label: "Raportör", desc: "İhbarları görüntüleyebilir, mesaj yazabilir" },
  { value: "MANAGER", label: "İnceleyen", desc: "İhbarları yönetebilir, atama yapabilir" },
  { value: "ADMIN", label: "Yönetici", desc: "Tam yetki, ayarlar ve ekip yönetimi" },
];

type Member = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

type Invite = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  expiresAt: string;
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Yönetici",
  MANAGER: "İnceleyen",
  REVIEWER: "Raportör",
};

const roleStyles: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-50 text-purple-700",
  ADMIN: "bg-red-50 text-red-600",
  MANAGER: "bg-blue-50 text-blue-700",
  REVIEWER: "bg-gray-100 text-gray-600",
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("REVIEWER");

  const fetchMembers = useCallback(async () => {
    const res = await fetch("/api/team/members");
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members);
      setInvites(data.pendingInvites);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail,
        name: inviteName,
        role: inviteRole,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setSaving(false);
      return;
    }

    setSuccess(`${inviteName} için davet gönderildi`);
    setSaving(false);
    setShowInvite(false);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("REVIEWER");
    fetchMembers();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Ekip Yönetimi</h1>
          <p className="page-subtitle">
            Ekip üyelerinizi yönetin ve yeni kişiler davet edin
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Davet Gönder
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-[13px] mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-brand-50 text-brand-700 p-3 rounded-lg text-[13px] mb-4">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Invite Form */}
      {showInvite && (
        <div className="bg-white rounded-xl border border-gray-100 mb-5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-600" />
              Ekip Üyesi Davet Et
            </h3>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Davet gönderin, kişi e-postasındaki linkle şifre oluşturup giriş
              yapabilsin.
            </p>
          </div>
          <div className="p-6">
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Ad Soyad
                  </label>
                  <input
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Ali Veli"
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="ali@sirket.com"
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">
                  Yetki
                </label>
                <div className="flex gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setInviteRole(r.value)}
                      className={`flex-1 p-3.5 rounded-xl border-2 text-left transition-all ${
                        inviteRole === r.value
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-[13px]">{r.label}</p>
                      <p className="text-[11px] text-gray-500">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  {saving ? "Gönderiliyor..." : "Davet Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Members */}
      <div className="bg-white rounded-xl border border-gray-100 mb-5 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-400" />
          <h3 className="section-title">Ekip Üyeleri ({members.length})</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            Henüz ekip üyesi yok
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {members.map((m) => (
              <div
                key={m.id}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[12px] font-bold">
                    {m.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-gray-900">
                      {m.name}
                    </p>
                    <p className="text-[12px] text-gray-400">{m.email}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    roleStyles[m.role] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {roleLabels[m.role] || m.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <h3 className="section-title">
              Bekleyen Davetler ({invites.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="px-6 py-3.5 flex items-center justify-between"
              >
                <div>
                  <p className="text-[13px] font-medium text-gray-900">
                    {inv.name}
                  </p>
                  <p className="text-[12px] text-gray-400">{inv.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      roleStyles[inv.role] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {roleLabels[inv.role] || inv.role}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(inv.expiresAt).toLocaleDateString("tr-TR")}
                    &apos;e kadar
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
