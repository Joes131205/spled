import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put('')
  async update(@Body() body: any) {
    return await this.profileService.update(body);
  }
}
