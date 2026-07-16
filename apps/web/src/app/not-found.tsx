import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QrCode } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-muted">
            <QrCode className="size-12 text-muted-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-6xl font-black text-foreground mb-2">404</h1>
          <h2 className="text-xl font-semibold">Page not found</h2>
          <p className="text-muted-foreground mt-2">The page you&apos;re looking for doesn&apos;t exist.</p>
        </div>
        <Link href="/dashboard">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
