import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';
import { UpdateProfileDto } from './dto/updateProfileDto';

@Controller('profile')
@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put('')
  @ApiOperation({ summary: 'Update the authenticated user profile' })
  @ApiBody({ type: UpdateProfileDto })
  async update(@Body() body: UpdateProfileDto) {
    return await this.profileService.update(body);
  }
}
