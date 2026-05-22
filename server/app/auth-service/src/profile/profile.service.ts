import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../db/prisma.client';
import bcrypt from 'bcryptjs';

@Injectable()
export class ProfileService {
  async update(userId: string, body: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: any = {};
    if (body.username) data.username = body.username;
    if (body.email) data.email = body.email;
    if (body.displayName !== undefined) data.displayName = body.displayName;
    if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl;
    
    if (body.password) {
      data.password = await bcrypt.hash(body.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }
}
