import Link from "next/link";
import { Shield, Lock, Eye, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">EthicAll</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Giriş Yap</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Ücretsiz Deneyin</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Kurumsal Anonim<br />Etik İhbar Platformu
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Çalışanlarınıza güvenli ve anonim bir ihbar kanalı sunun.
              AB Whistleblower Directive ve GDPR uyumlu.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2">
                  Hemen Başlayın <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/report/demo">
                <Button size="lg" variant="outline">
                  Demo İhbar Portalı
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Neden EthicAll?</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Lock, title: "Tam Anonimlik", desc: "Kimlik bilgileri şirketinizle asla paylaşılmaz" },
                { icon: Shield, title: "AB Uyumlu", desc: "Whistleblower Directive 2019/1937 ve GDPR uyumlu" },
                { icon: Eye, title: "Şeffaf Takip", desc: "İhbarcılar takip koduyla durumu izleyebilir" },
                { icon: Clock, title: "SLA Yönetimi", desc: "Otomatik SLA takibi ve uyarı sistemi" },
              ].map((item) => (
                <div key={item.title} className="text-center p-6 rounded-lg border bg-white">
                  <item.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} EthicAll. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
