import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  async register(@Body() body: any) {
    return await this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return await this.authService.login(body);
  }

  @Get('me')
  async getMe(@Body() body: any) {
    return await this.authService.login(body);
  }
}
