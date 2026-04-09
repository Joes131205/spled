import { Body, Controller, Get, Post, UseMiddleware } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createUserDto } from '../../utils/dto/createUserDto';
import { loginUserDto } from '../../utils/dto/loginUserDto';
import { authMiddleware } from '@spled/shared';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  async register(@Body() body: createUserDto) {
    return await this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: loginUserDto) {
    return await this.authService.login(body);
  }

  @Get('me')
  @UseMiddleware(authMiddleware)
  async getMe() {
    return await this.authService.getMe();
  }
}
