export const QR_TYPES = [
  { value: 'URL', label: 'Website URL', icon: 'Globe', description: 'Link to any website or webpage' },
  { value: 'VCARD', label: 'Contact Card', icon: 'User', description: 'Digital business card (vCard)' },
  { value: 'WIFI', label: 'WiFi Network', icon: 'Wifi', description: 'Connect to a WiFi network' },
  { value: 'TEXT', label: 'Plain Text', icon: 'FileText', description: 'Display a text message' },
  { value: 'EMAIL', label: 'Email', icon: 'Mail', description: 'Open email client with pre-filled fields' },
  { value: 'PHONE', label: 'Phone', icon: 'Phone', description: 'Dial a phone number' },
  { value: 'SMS', label: 'SMS', icon: 'MessageSquare', description: 'Send a pre-filled text message' },
  { value: 'CRYPTO', label: 'Crypto Payment', icon: 'Bitcoin', description: 'Cryptocurrency payment address' },
  { value: 'LOCATION', label: 'Location', icon: 'MapPin', description: 'Point to a geographic location' },
  { value: 'EVENT', label: 'Calendar Event', icon: 'Calendar', description: 'Add an event to calendar' },
] as const

export const QR_STYLES = [
  { value: 'STANDARD', label: 'Standard', description: 'Classic square dots' },
  { value: 'ROUNDED', label: 'Rounded', description: 'Smooth rounded dots' },
  { value: 'DOTS', label: 'Dots', description: 'Circle dot pattern' },
  { value: 'CLASSY', label: 'Classy', description: 'Sophisticated style' },
] as const

export const ERROR_CORRECTION_LEVELS = [
  { value: 'L', label: 'Low (7%)', description: 'Smallest file size' },
  { value: 'M', label: 'Medium (15%)', description: 'Balanced (recommended)' },
  { value: 'Q', label: 'Quartile (25%)', description: 'Better for logos' },
  { value: 'H', label: 'High (30%)', description: 'Maximum recovery' },
] as const

export const PRESET_COLORS = [
  '#000000', '#ffffff', '#6366f1', '#8b5cf6', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#1d4ed8', '#7c3aed',
]

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/dashboard/qrcodes', label: 'QR Codes', icon: 'QrCode' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: 'BarChart3' },
  { href: '/dashboard/folders', label: 'Folders', icon: 'FolderOpen' },
  { href: '/dashboard/organization', label: 'Organization', icon: 'Building2' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
]

export const PLAN_FEATURES = {
  FREE: ['5 QR codes', '500 scans/month', '1 user', 'Basic analytics'],
  STARTER: ['50 QR codes', '10K scans/month', '3 users', 'Dynamic QR codes', 'Full analytics'],
  PRO: ['500 QR codes', '100K scans/month', '10 users', 'API access', 'Custom domain', 'Priority support'],
  ENTERPRISE: ['Unlimited QR codes', 'Unlimited scans', 'Unlimited users', 'White label', 'SLA', 'Dedicated support'],
}
