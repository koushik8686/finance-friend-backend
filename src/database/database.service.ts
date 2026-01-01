import { Injectable, OnModuleDestroy } from '@nestjs/common';
// import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

/**
 * Global singleton for Prisma (serverless safe)
 */


@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    if (!global.__prisma) {
      const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      });

      global.__prisma = new PrismaClient({ adapter });
    }

    this.prisma = global.__prisma;
  }

  /**
   * Expose Prisma Client
   */
  get client(): PrismaClient {
    return this.prisma;
  }

  /**
   * Graceful shutdown (local / dev)
   */
  async onModuleDestroy() {
    await this.prisma?.$disconnect();
  }
}
