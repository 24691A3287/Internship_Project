import QRCode from 'qrcode'

export interface QRGenerateOptions {
  content: string
  size?: number
  margin?: number
  fgColor?: string
  bgColor?: string
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

export async function generateQRDataURL(options: QRGenerateOptions): Promise<string> {
  const {
    content,
    size = 300,
    margin = 4,
    fgColor = '#000000',
    bgColor = '#ffffff',
    errorCorrectionLevel = 'M',
  } = options

  return QRCode.toDataURL(content, {
    errorCorrectionLevel,
    type: 'image/png',
    margin,
    width: size,
    color: {
      dark: fgColor,
      light: bgColor,
    },
  })
}

export async function generateQRSVG(options: QRGenerateOptions): Promise<string> {
  const { content, margin = 4, fgColor = '#000000', bgColor = '#ffffff', errorCorrectionLevel = 'M' } = options
  return QRCode.toString(content, {
    type: 'svg',
    margin,
    errorCorrectionLevel,
    color: { dark: fgColor, light: bgColor },
  })
}

export async function generateQRBuffer(options: QRGenerateOptions): Promise<Buffer> {
  const {
    content,
    size = 300,
    margin = 4,
    fgColor = '#000000',
    bgColor = '#ffffff',
    errorCorrectionLevel = 'M',
  } = options

  return QRCode.toBuffer(content, {
    errorCorrectionLevel,
    type: 'png',
    margin,
    width: size,
    color: { dark: fgColor, light: bgColor },
  })
}

export function buildQRContent(type: string, data: Record<string, string>): string {
  switch (type) {
    case 'URL':
      return data.url ?? ''
    case 'TEXT':
      return data.text ?? ''
    case 'EMAIL':
      return `mailto:${data.email}${data.subject ? `?subject=${encodeURIComponent(data.subject)}` : ''}${data.body ? `&body=${encodeURIComponent(data.body)}` : ''}`
    case 'PHONE':
      return `tel:${data.phone}`
    case 'SMS':
      return `sms:${data.phone}${data.message ? `?body=${encodeURIComponent(data.message)}` : ''}`
    case 'WIFI':
      return `WIFI:T:${data.security ?? 'WPA'};S:${data.ssid};P:${data.password};;`
    case 'VCARD':
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
        data.org ? `ORG:${data.org}` : '',
        data.title ? `TITLE:${data.title}` : '',
        data.phone ? `TEL:${data.phone}` : '',
        data.email ? `EMAIL:${data.email}` : '',
        data.website ? `URL:${data.website}` : '',
        data.address ? `ADR:;;${data.address}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n')
    case 'LOCATION':
      return `geo:${data.lat},${data.lng}${data.query ? `?q=${encodeURIComponent(data.query)}` : ''}`
    case 'CRYPTO':
      return `${data.currency?.toLowerCase()}:${data.address}${data.amount ? `?amount=${data.amount}` : ''}`
    case 'EVENT':
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${data.title ?? ''}`,
        `DTSTART:${data.startDate?.replace(/[-:]/g, '') ?? ''}`,
        `DTEND:${data.endDate?.replace(/[-:]/g, '') ?? ''}`,
        data.location ? `LOCATION:${data.location}` : '',
        data.description ? `DESCRIPTION:${data.description}` : '',
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\n')
    default:
      return data.content ?? ''
  }
}
