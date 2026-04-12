import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { createUserDto } from '../../utils/dto/createUserDto';
import { loginUserDto } from '../../utils/dto/loginUserDto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: createUserDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: loginUserDto) {
    return this.authService.login(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request & { user: { sub: string } }) {
    return this.authService.getMe(req.user);
  }
}
