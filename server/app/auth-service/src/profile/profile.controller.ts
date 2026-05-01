import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';

type AuthenticatedRequest = Request & { user: { userId: string } };

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.profileService.getProfile(req.user.userId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: { displayName?: string; avatarUrl?: string },
  ) {
    return this.profileService.updateProfile(req.user.userId, body);
  }
}