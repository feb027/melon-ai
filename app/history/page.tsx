import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, History } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Riwayat Analisis</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Riwayat</CardTitle>
            <CardDescription className="text-center">
              Fitur riwayat akan diimplementasikan di task berikutnya
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <History className="h-16 w-16 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Halaman riwayat analisis akan ditambahkan pada Task 26
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
