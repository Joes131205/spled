import { BadRequestException, Injectable } from '@nestjs/common';
import { InactivityLevel } from '../generated/prisma/enums.js';
import { prisma } from '../db/prisma.client.js';

@Injectable()
export class GhostBusterService {
  private inactivityThresholdDays = 7;

  private parseThresholdDays(raw?: string): number {
    if (!raw || raw.trim() === '') {
      return this.inactivityThresholdDays;
    }

    const normalized = raw.trim().toLowerCase();
    const dayPattern = /^(\d+)d$/;
    const plainPattern = /^(\d+)$/;

    if (dayPattern.test(normalized)) {
      const [, daysText] = normalized.match(dayPattern)!;
      return Number(daysText);
    }

    if (plainPattern.test(normalized)) {
      return Number(normalized);
    }

    throw new BadRequestException(
      'Invalid inactivityThreshold format. Use "7d" or "7".',
    );
  }

  async getFlaggedMembers(projectId: string) {
    const thresholdDays = this.inactivityThresholdDays;

    const flags = await prisma.ghostBusterFlag.findMany({
      where: {
        projectId,
        OR: [
          { level: InactivityLevel.FLAGGED },
          { noUpdateDays: { gte: thresholdDays } },
        ],
      },
      orderBy: [{ noUpdateDays: 'desc' }, { updatedAt: 'desc' }],
    });

    return {
      projectId,
      inactivityThresholdDays: thresholdDays,
      total: flags.length,
      items: flags,
    };
  }

  updateSettings(inactivityThreshold?: string) {
    const parsed = this.parseThresholdDays(inactivityThreshold);
    this.inactivityThresholdDays = parsed;

    return {
      inactivityThreshold: `${parsed}d`,
      inactivityThresholdDays: parsed,
      message: 'Ghost buster settings updated',
    };
  }
}
