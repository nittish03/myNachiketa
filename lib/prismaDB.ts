import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prismaDB: PrismaClient }

function createPrismaClient() {
  return new PrismaClient()
}

function getPrismaClient() {
  const existing = globalForPrisma.prismaDB
  if (existing && 'instaSiteAuditLog' in existing) return existing
  const client = createPrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaDB = client
  return client
}

export const prismaDB = getPrismaClient()
