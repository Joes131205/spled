import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { createUserDto } from '../utils/dto/createUserDto';
import { loginUserDto } from '../utils/dto/loginUserDto';
import { prisma } from '../db/prisma.client';

const db = prisma;

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  private sanitizeUser<T extends { password: string }>(user: T) {
    const { password, ...safeUser } = user;
    void password;
    return safeUser;
  }

  async register(body: createUserDto) {
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: body.email }, { username: body.username }],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email or username already exists');
    }

    const password = await bcrypt.hash(body.password, 10);
    const user = await db.user.create({
      data: {
        username: body.username,
        email: body.email,
        password,
        role: body.role as any,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  async login(body: loginUserDto) {
    const user = await db.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(body.password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  async getMe(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return this.sanitizeUser(user);
  }

  async getUserById(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async checkEmail(email: string) {
    const user = await db.user.findUnique({
      where: { email },
    });
    return { 
      exists: !!user,
      id: user?.id,
      role: user?.role
    };
  }
}
