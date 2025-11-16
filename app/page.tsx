import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <div className="container mx-auto p-4 space-y-8 min-h-screen">
      <main className="flex flex-col gap-8 items-center">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold">MelonAI</h1>
          <p className="text-lg text-muted-foreground">
            Sistem analisis kematangan semangka menggunakan AI
          </p>
          <Badge variant="outline">shadcn/ui Component Test</Badge>
        </div>

        {/* Component Testing Section */}
        <div className="w-full max-w-4xl space-y-6">
          {/* Button Component Test */}
          <Card>
            <CardHeader>
              <CardTitle>Button Components</CardTitle>
              <CardDescription>Testing different button variants</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button size="lg">Large Button</Button>
              <Button size="sm">Small</Button>
            </CardContent>
          </Card>

          {/* Badge Component Test */}
          <Card>
            <CardHeader>
              <CardTitle>Badge Components</CardTitle>
              <CardDescription>Testing badge variants for status indicators</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge className="bg-success text-white">Matang</Badge>
              <Badge className="bg-warning text-white">Belum Matang</Badge>
            </CardContent>
          </Card>

          {/* Alert Component Test */}
          <Alert>
            <AlertDescription>
              Ini adalah contoh alert component untuk notifikasi penting.
            </AlertDescription>
          </Alert>

          {/* Progress Component Test */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Component</CardTitle>
              <CardDescription>Testing progress bar for confidence levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confidence Level</span>
                  <span>85%</span>
                </div>
                <Progress value={85} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sweetness Level</span>
                  <span>7/10</span>
                </div>
                <Progress value={70} />
              </div>
            </CardContent>
          </Card>

          {/* Skeleton Component Test */}
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Components</CardTitle>
              <CardDescription>Testing loading states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Result Mock */}
          <Card>
            <CardHeader>
              <CardTitle>Hasil Analisis Semangka</CardTitle>
              <CardDescription>Contoh tampilan hasil analisis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status Kematangan:</span>
                <Badge className="bg-success text-white">Matang</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tingkat Kepercayaan</span>
                  <span>92%</span>
                </div>
                <Progress value={92} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tingkat Kemanisan</span>
                  <span>8/10</span>
                </div>
                <Progress value={80} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Jenis Semangka:</span>
                <Badge variant="outline">Merah</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Kualitas Kulit:</span>
                <Badge variant="secondary">Baik</Badge>
              </div>
              <div className="flex gap-4 pt-4">
                <Button className="flex-1">Foto Lagi</Button>
                <Button variant="outline" className="flex-1">Lihat Detail</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
