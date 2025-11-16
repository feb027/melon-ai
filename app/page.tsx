export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <main className="flex flex-col gap-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              MelonAI
            </h1>
            <p className="text-lg text-muted-foreground">
              Tailwind CSS v4 Configuration Test
            </p>
          </div>

          {/* Color Test Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Primary Color */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-16 h-16 bg-primary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Primary (Matang)
              </h3>
              <p className="text-sm text-muted-foreground">
                Green color for ripe watermelons
              </p>
            </div>

            {/* Secondary Color */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-16 h-16 bg-secondary rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Secondary (Belum Matang)
              </h3>
              <p className="text-sm text-muted-foreground">
                Orange color for unripe watermelons
              </p>
            </div>

            {/* Success Color */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-16 h-16 bg-success rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Success
              </h3>
              <p className="text-sm text-muted-foreground">
                Success state color
              </p>
            </div>

            {/* Warning Color */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-16 h-16 bg-warning rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Warning
              </h3>
              <p className="text-sm text-muted-foreground">
                Warning state color
              </p>
            </div>

            {/* Error Color */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-16 h-16 bg-error rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Error
              </h3>
              <p className="text-sm text-muted-foreground">
                Error state color
              </p>
            </div>

            {/* Info Color */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-16 h-16 bg-info rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Info
              </h3>
              <p className="text-sm text-muted-foreground">
                Info state color
              </p>
            </div>
          </div>

          {/* Typography Test */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-card-foreground mb-4">
              Typography Scale
            </h2>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Extra Small (12px)</p>
              <p className="text-sm text-muted-foreground">Small (14px)</p>
              <p className="text-base text-foreground">Base (16px)</p>
              <p className="text-lg text-foreground">Large (18px)</p>
              <p className="text-xl text-foreground">Extra Large (20px)</p>
              <p className="text-2xl font-semibold text-foreground">2XL (24px)</p>
            </div>
          </div>

          {/* Button Test */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-card-foreground mb-4">
              Button Styles
            </h2>
            <div className="flex flex-wrap gap-4">
              <button className="min-h-11 min-w-11 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                Primary Button
              </button>
              <button className="min-h-11 min-w-11 px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                Secondary Button
              </button>
              <button className="min-h-11 min-w-11 px-6 py-2 border border-border bg-background text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
                Outline Button
              </button>
            </div>
          </div>

          {/* Responsive Test */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-card-foreground mb-4">
              Responsive Breakpoints
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">
                <span className="font-semibold">Current breakpoint:</span>
                <span className="ml-2 xs:hidden sm:hidden md:hidden lg:hidden xl:hidden">Default (xs: 320px)</span>
                <span className="ml-2 hidden xs:inline sm:hidden">xs (320px)</span>
                <span className="ml-2 hidden sm:inline md:hidden">sm (375px)</span>
                <span className="ml-2 hidden md:inline lg:hidden">md (425px)</span>
                <span className="ml-2 hidden lg:inline xl:hidden">lg (768px)</span>
                <span className="ml-2 hidden xl:inline">xl (1024px+)</span>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
