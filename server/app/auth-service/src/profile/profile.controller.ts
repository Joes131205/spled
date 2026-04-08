import { Body, Controller, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put('')
  async update(@Body() body: any) {
    return await this.profileService.update(body);
  }
}
