"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  UserPlus, Building2, RefreshCw, Copy, Check, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PLANS = [
  { value: "ESSENTIAL", label: "Essential", desc: "0-100 calisan" },
  { value: "SHIELD", label: "Shield", desc: "100-250 calisan" },
  { value: "VAULT", label: "Vault", desc: "250+ calisan" },
];

type Org = {
  id: string;
  name: string;
  slug: string;
  domain: string;
  plan: string;
  createdAt: string;
  _count: { users: number; reports: number };
};

function generatePassword(length = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  let pw = "";
  for (let i = 0; i < length; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [plan, setPlan] = useState("ESSENTIAL");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  const fetchOrgs = useCallback(async () => {
    const res = await fetch("/api/admin/organizations");
    if (res.ok) {
      const data = await res.json();
      setOrgs(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSuperAdmin) fetchOrgs();
    else setLoading(false);
  }, [isSuperAdmin, fetchOrgs]);

  if (!isSuperAdmin) {
    router.push("/dashboard");
    return null;
  }

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);
  }

  function handleOrgNameChange(val: string) {
    setOrgName(val);
    setSlug(autoSlug(val));
  }

  function handleEmailDomainChange(val: string) {
    setEmailDomain(val);
    // Auto-update admin email domain
    if (adminEmail) {
      const localPart = adminEmail.split("@")[0];
      setAdminEmail(`${localPart}@${val}`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Validate email domain match
    const adminDomain = adminEmail.split("@")[1];
    if (adminDomain !== emailDomain) {
      setError(`Admin e-posta uzantisi (${adminDomain}) sirket mail uzantisi (${emailDomain}) ile eslesmeli`);
      setSaving(false);
      return;
    }

    const res = await fetch("/api/admin/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgName, slug, domain, emailDomain, plan,
        adminName, adminEmail, adminPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setSaving(false);
      return;
    }

    setSuccess(`"${orgName}" basariyla olusturuldu! Admin: ${adminEmail}`);
    setSaving(false);
    setShowForm(false);
    // Reset form
    setOrgName(""); setSlug(""); setDomain(""); setEmailDomain("");
    setPlan("ESSENTIAL"); setAdminName(""); setAdminEmail(""); setAdminPassword("");
    fetchOrgs();
  }

  function copyPassword() {
    navigator.clipboard.writeText(adminPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const planColors: Record<string, string> = {
    TRIAL: "bg-gray-100 text-gray-700",
    ESSENTIAL: "bg-blue-100 text-blue-700",
    SHIELD: "bg-green-100 text-green-700",
    VAULT: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kullanicilar & Organizasyonlar</h1>
          <p className="text-sm text-gray-500">Yeni sirket hesaplari olusturun ve yetkilendirin</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Yeni Sirket Olustur
        </Button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4">{success}</div>}

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Yeni Sirket & Admin Olustur
            </CardTitle>
            <CardDescription>
              Satin alan musterinin hesabini olusturun. Admin kullanici bilgilerini girin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Info */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-sm text-gray-700">Sirket Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sirket Adi</Label>
                    <Input value={orgName} onChange={(e) => handleOrgNameChange(e.target.value)} placeholder="Ornek A.S." required />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (URL)</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ornek-as" required />
                    <p className="text-xs text-gray-400">/report/{slug || "..."}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Domain</Label>
                    <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="ornek.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Mail Uzantisi (Dogrulama icin)</Label>
                    <Input value={emailDomain} onChange={(e) => handleEmailDomainChange(e.target.value)} placeholder="ornek.com" required />
                    <p className="text-xs text-gray-400">Ihbarci mailleri bu uzanti ile dogrulanacak</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <div className="flex gap-3">
                    {PLANS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPlan(p.value)}
                        className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                          plan === p.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="font-semibold text-sm">{p.label}</p>
                        <p className="text-xs text-gray-500">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admin User Info */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-sm text-gray-700">Sirket Yetkilisi (Admin)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ad Soyad</Label>
                    <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Ahmet Yilmaz" required />
                  </div>
                  <div className="space-y-2">
                    <Label>E-posta</Label>
                    <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder={`admin@${emailDomain || "ornek.com"}`} required />
                    {adminEmail && emailDomain && adminEmail.split("@")[1] !== emailDomain && (
                      <p className="text-xs text-red-500">Mail uzantisi sirket domaini ile eslesmeli!</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Sifre</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="En az 8 karakter"
                        minLength={8}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button type="button" variant="outline" onClick={() => setAdminPassword(generatePassword())} className="gap-1 shrink-0">
                      <RefreshCw className="h-4 w-4" />
                      Rastgele
                    </Button>
                    {adminPassword && (
                      <Button type="button" variant="outline" onClick={copyPassword} className="gap-1 shrink-0">
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Iptal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Olusturuluyor..." : "Sirket & Admin Olustur"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>Tum Organizasyonlar ({orgs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Yukleniyor...</div>
          ) : orgs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Henuz organizasyon yok</div>
          ) : (
            <div className="divide-y">
              {orgs.map((org) => (
                <div key={org.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{org.name}</p>
                      <Badge className={planColors[org.plan] || "bg-gray-100"}>
                        {org.plan}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {org.slug} &middot; {org.domain} &middot; {org._count.users} kullanici &middot; {org._count.reports} ihbar
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(org.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
