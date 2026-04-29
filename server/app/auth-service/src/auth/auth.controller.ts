import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { createUserDto } from '../utils/dto/createUserDto';
import { loginUserDto } from '../utils/dto/loginUserDto';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';

type AuthenticatedRequest = Request & { user: { userId: string } };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get me / current authenticated user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: AuthenticatedRequest) {
    return this.authService.getMe(req.user.userId);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: createUserDto })
  register(@Body() body: createUserDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: loginUserDto })
  login(@Body() body: loginUserDto) {
    return this.authService.login(body);
  }
}
