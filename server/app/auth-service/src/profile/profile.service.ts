import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../db/prisma.client';

const db = prisma;

@Injectable()
export class ProfileService {

  async getProfile(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...safe } = user;
    void password;
    return safe;
  }

  async updateProfile(userId: string, body: { displayName?: string; avatarUrl?: string }) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const updated = await db.user.update({
      where: { id: userId },
      data: {
        displayName: body.displayName ?? user.displayName,
        avatarUrl: body.avatarUrl ?? user.avatarUrl,
      },
    });
    const { password, ...safe } = updated;
    void password;
    return safe;
  }
}