export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to FamilySync
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Family coordination made simple
        </p>
        <div className="max-w-md mx-auto space-y-4">
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-lg font-semibold mb-2">🚀 Getting Started</h2>
            <p className="text-sm text-muted-foreground">
              This is the foundation of your family coordination app. 
              Next.js PWA with TypeScript and Tailwind CSS is ready!
            </p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-lg font-semibold mb-2">📱 PWA Ready</h2>
            <p className="text-sm text-muted-foreground">
              This app can be installed on mobile devices and works offline.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}