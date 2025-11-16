import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
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
          <h1 className="text-xl font-semibold">Analitik</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Dashboard Analitik</CardTitle>
            <CardDescription className="text-center">
              Fitur analitik akan diimplementasikan di task berikutnya
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <TrendingUp className="h-16 w-16 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Dashboard analitik akan ditambahkan pada Task 21-24
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
