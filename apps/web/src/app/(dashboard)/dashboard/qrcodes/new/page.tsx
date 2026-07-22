import type { Metadata } from 'next'
import { QRCreatorWizard } from '@/components/qr/QRCreatorWizard'

export const metadata: Metadata = { title: 'Create QR Code' }

export default function NewQRCodePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create QR Code</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Choose a type and customize your QR code</p>
      </div>
      <QRCreatorWizard />
    </div>
  )
}
