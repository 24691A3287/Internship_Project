import type { Metadata } from 'next'
import { QRCodesContent } from './QRCodesContent'

export const metadata: Metadata = { title: 'QR Codes' }

export default function QRCodesPage() {
  return <QRCodesContent />
}
