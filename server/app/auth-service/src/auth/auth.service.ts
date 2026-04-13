import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { createUserDto } from '../../utils/dto/createUserDto';
import { loginUserDto } from '../../utils/dto/loginUserDto';
import { prisma } from '../db/prisma.client';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async register(body: createUserDto) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: body.email }, { username: body.username }],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email or username already exists');
    }

    const password = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        ...body,
        password,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
    });

    return {
      user,
      accessToken,
    };
  }

  async login(body: loginUserDto) {
    const user = await prisma.user.findUnique({
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
    });

    return {
      user,
      accessToken,
    };
  }

  async getMe(currentUser: { sub: string }) {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return user;
  }
}
