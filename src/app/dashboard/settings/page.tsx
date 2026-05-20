"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ayarlar</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Organizasyon Ayarları
          </CardTitle>
          <CardDescription>
            Ayarlar sayfası yakında eklenecektir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Bu özellik geliştirme aşamasındadır.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
