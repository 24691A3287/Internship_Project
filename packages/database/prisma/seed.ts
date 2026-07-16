import { PrismaClient, UserRole, QRType, QRStyle, ErrorCorrection, PlanType, OrgMemberRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean up
  await prisma.auditLog.deleteMany()
  await prisma.qRScan.deleteMany()
  await prisma.qRCode.deleteMany()
  await prisma.folder.deleteMany()
  await prisma.apiKey.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.orgMember.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()

  // Create super admin user
  const superAdmin = await prisma.user.create({
    data: {
      clerkId: 'user_seed_superadmin',
      email: 'admin@qrplatform.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
    },
  })

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      clerkId: 'user_seed_demo',
      email: 'demo@qrplatform.com',
      firstName: 'Demo',
      lastName: 'User',
      role: UserRole.MEMBER,
    },
  })

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      plan: PlanType.PRO,
      description: 'Demo organization for testing',
    },
  })

  // Create subscription
  await prisma.subscription.create({
    data: {
      organizationId: org.id,
      plan: PlanType.PRO,
      status: 'active',
    },
  })

  // Add members
  await prisma.orgMember.create({
    data: {
      userId: superAdmin.id,
      organizationId: org.id,
      role: OrgMemberRole.OWNER,
    },
  })

  await prisma.orgMember.create({
    data: {
      userId: demoUser.id,
      organizationId: org.id,
      role: OrgMemberRole.MEMBER,
    },
  })

  // Create folders
  const marketingFolder = await prisma.folder.create({
    data: {
      name: 'Marketing',
      color: '#6366f1',
      organizationId: org.id,
      createdById: superAdmin.id,
    },
  })

  const productFolder = await prisma.folder.create({
    data: {
      name: 'Product',
      color: '#22c55e',
      organizationId: org.id,
      createdById: superAdmin.id,
    },
  })

  // Create QR codes
  const qrCodes = [
    {
      name: 'Company Website',
      type: QRType.URL,
      content: 'https://acme.com',
      destinationUrl: 'https://acme.com',
      isDynamic: true,
      folderId: marketingFolder.id,
      totalScans: 1234,
      uniqueScans: 876,
    },
    {
      name: 'Product Catalog',
      type: QRType.URL,
      content: 'https://acme.com/catalog',
      destinationUrl: 'https://acme.com/catalog',
      isDynamic: true,
      folderId: productFolder.id,
      totalScans: 567,
      uniqueScans: 432,
    },
    {
      name: 'Contact vCard',
      type: QRType.VCARD,
      content: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Acme Corp\nEND:VCARD',
      isDynamic: false,
      folderId: marketingFolder.id,
      totalScans: 89,
      uniqueScans: 74,
    },
    {
      name: 'Office WiFi',
      type: QRType.WIFI,
      content: 'WIFI:T:WPA;S:AcmeOffice;P:SecurePass123;;',
      isDynamic: false,
      totalScans: 445,
      uniqueScans: 312,
    },
  ]

  for (const qr of qrCodes) {
    await prisma.qRCode.create({
      data: {
        ...qr,
        style: QRStyle.STANDARD,
        errorCorrection: ErrorCorrection.M,
        organizationId: org.id,
        createdById: superAdmin.id,
        lastScannedAt: new Date(),
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`   - ${2} users created`)
  console.log(`   - ${1} organization created`)
  console.log(`   - ${qrCodes.length} QR codes created`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
