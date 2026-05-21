import Link from "next/link";
import { Shield, Lock, Eye, Clock, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">EthicAll</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Ücretsiz Deneyin
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-28 bg-gradient-to-b from-brand-50/60 to-white">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-[13px] font-medium mb-6">
              <Shield className="h-3.5 w-3.5" />
              AB Whistleblower Directive Uyumlu
            </div>
            <h1 className="text-[52px] font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              Kurumsal Anonim<br />Etik İhbar Platformu
            </h1>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Çalışanlarınıza güvenli ve anonim bir ihbar kanalı sunun.
              GDPR uyumlu, uçtan uca şifreli, tam izlenebilir.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-600/20"
              >
                Hemen Başlayın <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/report/demo"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Demo İhbar Portalı
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4 tracking-tight">
              Neden EthicAll?
            </h2>
            <p className="text-center text-gray-500 mb-14 max-w-lg mx-auto">
              Kurumunuzun etik standartlarını yükseltin.
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Lock, title: "Tam Anonimlik", desc: "Kimlik bilgileri şirketinizle asla paylaşılmaz", color: "bg-brand-50 text-brand-600" },
                { icon: Shield, title: "AB Uyumlu", desc: "Whistleblower Directive 2019/1937 ve GDPR uyumlu", color: "bg-blue-50 text-blue-600" },
                { icon: Eye, title: "Şeffaf Takip", desc: "İhbarcılar takip koduyla durumu izleyebilir", color: "bg-amber-50 text-amber-600" },
                { icon: Clock, title: "SLA Yönetimi", desc: "Otomatik SLA takibi ve uyarı sistemi", color: "bg-purple-50 text-purple-600" },
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
                  <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-[13px] text-gray-400">
          <p>&copy; {new Date().getFullYear()} EthicAll. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
