// ============================================================
// SHARED TYPES — @qr-platform/types
// ============================================================

// --- Enums ---
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_OWNER = 'ORG_OWNER',
  ORG_ADMIN = 'ORG_ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum OrgMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum QRType {
  URL = 'URL',
  VCARD = 'VCARD',
  WIFI = 'WIFI',
  TEXT = 'TEXT',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SMS = 'SMS',
  CRYPTO = 'CRYPTO',
  LOCATION = 'LOCATION',
  EVENT = 'EVENT',
}

export enum QRStyle {
  STANDARD = 'STANDARD',
  ROUNDED = 'ROUNDED',
  DOTS = 'DOTS',
  CLASSY = 'CLASSY',
}

export enum ErrorCorrection {
  L = 'L',
  M = 'M',
  Q = 'Q',
  H = 'H',
}

export enum PlanType {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

// --- User Types ---
export interface User {
  id: string
  clerkId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  imageUrl?: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface UserWithOrgs extends User {
  orgMemberships: OrgMemberWithOrg[]
}

// --- Organization Types ---
export interface Organization {
  id: string
  clerkOrgId?: string | null
  name: string
  slug: string
  logoUrl?: string | null
  website?: string | null
  description?: string | null
  plan: PlanType
  createdAt: Date
  updatedAt: Date
}

export interface OrgMember {
  id: string
  userId: string
  organizationId: string
  role: OrgMemberRole
  joinedAt: Date
  updatedAt: Date
}

export interface OrgMemberWithUser extends OrgMember {
  user: User
}

export interface OrgMemberWithOrg extends OrgMember {
  organization: Organization
}

// --- QR Code Types ---
export interface QRCode {
  id: string
  shortCode: string
  name: string
  description?: string | null
  type: QRType
  content: string
  destinationUrl?: string | null
  style: QRStyle
  fgColor: string
  bgColor: string
  errorCorrection: ErrorCorrection
  logoUrl?: string | null
  size: number
  margin: number
  isActive: boolean
  isDynamic: boolean
  totalScans: number
  uniqueScans: number
  lastScannedAt?: Date | null
  folderId?: string | null
  organizationId?: string | null
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface QRCodeWithDetails extends QRCode {
  folder?: Folder | null
  createdBy: User
  _count?: { scans: number }
}

export interface QRScan {
  id: string
  qrCodeId: string
  ip?: string | null
  userAgent?: string | null
  country?: string | null
  city?: string | null
  region?: string | null
  device?: string | null
  browser?: string | null
  os?: string | null
  referrer?: string | null
  scannedAt: Date
}

// --- Folder Types ---
export interface Folder {
  id: string
  name: string
  color: string
  organizationId?: string | null
  createdById: string
  parentFolderId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[]
  _count?: { qrCodes: number }
}

// --- API Key Types ---
export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  organizationId: string
  createdById: string
  lastUsedAt?: Date | null
  expiresAt?: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ApiKeyWithSecret extends ApiKey {
  rawKey: string // Only returned once on creation
}

// --- Analytics Types ---
export interface AnalyticsOverview {
  totalQRCodes: number
  activeQRCodes: number
  totalScans: number
  uniqueScans: number
  scanGrowth: number // percentage vs previous period
  topPerformingQR?: QRCode
}

export interface TimeSeriesDataPoint {
  date: string
  scans: number
  uniqueScans: number
}

export interface GeoDataPoint {
  country: string
  countryCode: string
  scans: number
  percentage: number
}

export interface DeviceBreakdown {
  device: string
  scans: number
  percentage: number
}

export interface BrowserBreakdown {
  browser: string
  scans: number
  percentage: number
}

export interface QRAnalytics {
  qrCode: QRCode
  overview: {
    totalScans: number
    uniqueScans: number
    scanGrowth: number
    avgScansPerDay: number
  }
  timeSeries: TimeSeriesDataPoint[]
  geo: GeoDataPoint[]
  devices: DeviceBreakdown[]
  browsers: BrowserBreakdown[]
  recentScans: QRScan[]
}

// --- API Response Types ---
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Array<{ path: string; message: string }>
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface QRCodeFilters extends PaginationParams {
  search?: string
  type?: QRType
  folderId?: string
  isActive?: boolean
  isDynamic?: boolean
  organizationId?: string
  dateFrom?: string
  dateTo?: string
}

// --- Audit Log Types ---
export interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId?: string | null
  userId?: string | null
  organizationId?: string | null
  metadata?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
}

// --- Subscription Types ---
export interface Subscription {
  id: string
  organizationId: string
  plan: PlanType
  status: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  currentPeriodStart?: Date | null
  currentPeriodEnd?: Date | null
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

// --- Plan Limits ---
export interface PlanLimits {
  maxQRCodes: number
  maxScansPerMonth: number
  maxMembers: number
  dynamicQRCodes: boolean
  analytics: boolean
  customDomain: boolean
  apiAccess: boolean
  whiteLabel: boolean
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    maxQRCodes: 5,
    maxScansPerMonth: 500,
    maxMembers: 1,
    dynamicQRCodes: false,
    analytics: false,
    customDomain: false,
    apiAccess: false,
    whiteLabel: false,
  },
  [PlanType.STARTER]: {
    maxQRCodes: 50,
    maxScansPerMonth: 10000,
    maxMembers: 3,
    dynamicQRCodes: true,
    analytics: true,
    customDomain: false,
    apiAccess: false,
    whiteLabel: false,
  },
  [PlanType.PRO]: {
    maxQRCodes: 500,
    maxScansPerMonth: 100000,
    maxMembers: 10,
    dynamicQRCodes: true,
    analytics: true,
    customDomain: true,
    apiAccess: true,
    whiteLabel: false,
  },
  [PlanType.ENTERPRISE]: {
    maxQRCodes: -1, // unlimited
    maxScansPerMonth: -1, // unlimited
    maxMembers: -1, // unlimited
    dynamicQRCodes: true,
    analytics: true,
    customDomain: true,
    apiAccess: true,
    whiteLabel: true,
  },
}
