import { PrismaClient } from '@prisma/client';

export class PrismaDatabase {
    public static prisma: PrismaClient | null = null;
    constructor() {}

    dbInstance()
    {
        if (!PrismaDatabase.prisma)
        {
            PrismaDatabase.prisma = new PrismaClient()
        }

        return PrismaDatabase.prisma
    }
}

// Export singleton instance for easy access
export const prisma = new PrismaDatabase().dbInstance();