"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Mail, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ROLES = [
  { value: "REVIEWER", label: "Raportor", desc: "Ihbarlari goruntuleyebilir, mesaj yazabilir" },
  { value: "MANAGER", label: "Inceleyen", desc: "Ihbarlari yonetebilir, atama yapabilir" },
  { value: "ADMIN", label: "Yonetici", desc: "Tam yetki, ayarlar ve ekip yonetimi" },
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

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setSaving(false);
      return;
    }

    setSuccess(`${inviteName} icin davet gonderildi (${inviteEmail})`);
    setSaving(false);
    setShowInvite(false);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("REVIEWER");
    fetchMembers();
  }

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Yonetici",
    MANAGER: "Inceleyen",
    REVIEWER: "Raportor",
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-700",
    ADMIN: "bg-red-100 text-red-700",
    MANAGER: "bg-blue-100 text-blue-700",
    REVIEWER: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ekip Yonetimi</h1>
          <p className="text-sm text-gray-500">Ekip uyelerinizi yonetin ve yeni kisiler davet edin</p>
        </div>
        <Button onClick={() => setShowInvite(!showInvite)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Davet Gonder
        </Button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4">{success}</div>}

      {showInvite && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Ekip Uyesi Davet Et
            </CardTitle>
            <CardDescription>
              Davet gonderin, kisi e-postasindaki linkle sifre olusturup giris yapabilsin.
              E-posta adresi sirket domain&apos;iyle eslesmeli.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ad Soyad</Label>
                  <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Ali Veli" required />
                </div>
                <div className="space-y-2">
                  <Label>E-posta</Label>
                  <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="ali@sirket.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Yetki</Label>
                <div className="flex gap-3">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setInviteRole(r.value)}
                      className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                        inviteRole === r.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-sm">{r.label}</p>
                      <p className="text-xs text-gray-500">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Iptal</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Gonderiliyor..." : "Davet Gonder"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Members */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ekip Uyeleri ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Yukleniyor...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Henuz ekip uyesi yok</div>
          ) : (
            <div className="divide-y">
              {members.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                      {m.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                  </div>
                  <Badge className={roleColors[m.role] || "bg-gray-100"}>
                    {roleLabels[m.role] || m.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Bekleyen Davetler ({invites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {invites.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{inv.name}</p>
                    <p className="text-xs text-gray-500">{inv.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={roleColors[inv.role] || "bg-gray-100"}>
                      {roleLabels[inv.role] || inv.role}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(inv.expiresAt).toLocaleDateString("tr-TR")}&apos;e kadar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
