import { PrismaClient } from '@prisma/client';

// Satu instance Prisma saja (mencegah koneksi menumpuk saat hot-reload dev)
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
