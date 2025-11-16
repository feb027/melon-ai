import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Sparkles, TrendingUp, Info } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 text-center space-y-4 sm:space-y-6">
        {/* App Title & Tagline */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">MelonAI</h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md px-4">
            Analisis kematangan semangka dengan AI dalam hitungan detik
          </p>
        </div>

        {/* Primary CTA Button - Camera Access */}
        <div className="w-full max-w-sm px-4 space-y-3 sm:space-y-4">
          <Button 
            size="lg" 
            className="w-full min-h-14 sm:min-h-16 text-base sm:text-lg font-semibold"
            asChild
          >
            <Link href="/camera">
              <Camera className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Foto Semangka
            </Link>
          </Button>
          
          {/* Secondary Actions */}
          <div className="flex gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              className="flex-1 min-h-11 text-sm sm:text-base"
              asChild
            >
              <Link href="/history">
                <TrendingUp className="mr-1 sm:mr-2 h-4 w-4" />
                Riwayat
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 min-h-11 text-sm sm:text-base"
              asChild
            >
              <Link href="/analytics">
                <TrendingUp className="mr-1 sm:mr-2 h-4 w-4" />
                Analitik
              </Link>
            </Button>
          </div>
        </div>

        {/* Tutorial Section - First-time Users */}
        <div className="w-full max-w-2xl mt-8 sm:mt-12 px-4">
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <h2 className="text-lg sm:text-xl font-semibold">Cara Menggunakan</h2>
          </div>
          
          {/* Mobile: Compact horizontal cards (below 768px) */}
          <div className="md:hidden space-y-3">
            {/* Step 1 */}
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0">
                  1
                </div>
                <div className="flex-1 text-left">
                  <CardTitle className="text-sm mb-1">Ambil Foto</CardTitle>
                  <CardDescription className="text-xs">
                    Foto semangka dari atas dengan pencahayaan yang baik
                  </CardDescription>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0">
                  2
                </div>
                <div className="flex-1 text-left">
                  <CardTitle className="text-sm mb-1">AI Menganalisis</CardTitle>
                  <CardDescription className="text-xs">
                    Tunggu beberapa detik sementara AI menganalisis gambar
                  </CardDescription>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0">
                  3
                </div>
                <div className="flex-1 text-left">
                  <CardTitle className="text-sm mb-1">Lihat Hasil</CardTitle>
                  <CardDescription className="text-xs">
                    Dapatkan informasi kematangan, kemanisan, dan kualitas
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desktop: Grid layout (768px and above) */}
          <div className="hidden md:grid grid-cols-3 gap-4">
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
        <Card className="w-full max-w-2xl mt-6 sm:mt-8 mx-4">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-center text-base sm:text-lg">Tips Foto Terbaik</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                <span>Pastikan semangka terlihat jelas dan tidak terpotong</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                <span>Gunakan pencahayaan alami atau lampu yang cukup terang</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                <span>Foto dari atas atau samping untuk hasil terbaik</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                <span>Hindari bayangan yang menutupi permukaan semangka</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Demo Section */}
      <section className="w-full max-w-2xl mx-auto mt-8 px-4 pb-8">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-center text-base sm:text-lg">Demo & Dokumentasi</CardTitle>
            <CardDescription className="text-center">
              Lihat demo komponen dan dokumentasi teknis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/demo/analysis-flow">
                <Sparkles className="mr-2 h-4 w-4" />
                Demo Alur Analisis Lengkap
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/demo/analysis-result">
                <Info className="mr-2 h-4 w-4" />
                Demo Tampilan Hasil
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/camera">
                <Camera className="mr-2 h-4 w-4" />
                Demo Kamera
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground border-t px-4">
        <p>MelonAI © 2024 - Teknologi AI untuk Pertanian Indonesia</p>
      </footer>
    </div>
  );
}
