"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function TeamPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ekip Yönetimi</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ekip Üyeleri
          </CardTitle>
          <CardDescription>
            Ekip yönetimi özelliği yakında eklenecektir.
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
