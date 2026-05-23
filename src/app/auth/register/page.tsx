"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      orgName: formData.get("orgName") as string,
      orgSlug: formData.get("orgSlug") as string,
      domain: formData.get("domain") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const result = await res.json();
      setError(result.error || "Kayıt sırasında bir hata oluştu");
      setLoading(false);
      return;
    }

    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">EthicAll</span>
          </Link>
          <CardTitle>Organizasyon Oluşturun</CardTitle>
          <CardDescription>Şirketiniz için etik ihbar platformunu kurun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Şirket Adı</Label>
                <Input id="orgName" name="orgName" required placeholder="Acme Şirket" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgSlug">URL Slug</Label>
                <Input id="orgSlug" name="orgSlug" required placeholder="acme" pattern="[a-z0-9-]+" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">E-posta Domaini</Label>
              <Input id="domain" name="domain" required placeholder="acme.com" />
            </div>
            <hr />
            <div className="space-y-2">
              <Label htmlFor="name">Adınız Soyadınız</Label>
              <Input id="name" name="name" required placeholder="Ahmet Yılmaz" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" required placeholder="ahmet@acme.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Oluşturuluyor..." : "Organizasyonu Oluştur"}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Zaten hesabınız var mı?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Giriş Yapın
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
