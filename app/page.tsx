import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Sparkles, TrendingUp, Info } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center space-y-6">
        {/* App Title & Tagline */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">MelonAI</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md">
            Analisis kematangan semangka dengan AI dalam hitungan detik
          </p>
        </div>

        {/* Primary CTA Button - Camera Access */}
        <div className="w-full max-w-sm space-y-4">
          <Button 
            size="lg" 
            className="w-full min-h-16 text-lg font-semibold"
            asChild
          >
            <Link href="/camera">
              <Camera className="mr-2 h-6 w-6" />
              Foto Semangka
            </Link>
          </Button>
          
          {/* Secondary Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 min-h-11"
              asChild
            >
              <Link href="/history">
                <TrendingUp className="mr-2 h-4 w-4" />
                Riwayat
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 min-h-11"
              asChild
            >
              <Link href="/analytics">
                <TrendingUp className="mr-2 h-4 w-4" />
                Analitik
              </Link>
            </Button>
          </div>
        </div>

        {/* Tutorial Section - First-time Users */}
        <div className="w-full max-w-2xl mt-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Info className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Cara Menggunakan</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Step 1 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mx-auto mb-2">
                  1
                </div>
                <CardTitle className="text-center text-base">Ambil Foto</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm">
                  Foto semangka dari atas dengan pencahayaan yang baik
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mx-auto mb-2">
                  2
                </div>
                <CardTitle className="text-center text-base">AI Menganalisis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm">
                  Tunggu beberapa detik sementara AI menganalisis gambar
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mx-auto mb-2">
                  3
                </div>
                <CardTitle className="text-center text-base">Lihat Hasil</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-sm">
                  Dapatkan informasi kematangan, kemanisan, dan kualitas
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <Card className="w-full max-w-2xl mt-8">
          <CardHeader>
            <CardTitle className="text-center">Tips Foto Terbaik</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Pastikan semangka terlihat jelas dan tidak terpotong</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Gunakan pencahayaan alami atau lampu yang cukup terang</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Foto dari atas atau samping untuk hasil terbaik</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Hindari bayangan yang menutupi permukaan semangka</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>MelonAI © 2024 - Teknologi AI untuk Pertanian Indonesia</p>
      </footer>
    </div>
  );
}
