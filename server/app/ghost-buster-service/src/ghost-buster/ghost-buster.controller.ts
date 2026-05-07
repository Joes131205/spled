import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBody, ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GhostBusterService } from './ghost-buster.service';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';
import { UpdateGhostBusterSettingsDto } from '../utils/dto/updateGhostBusterSettingsDto';

@Controller('ghost-buster')
@ApiTags('Ghost Buster')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class GhostBusterController {
  constructor(private readonly ghostBusterService: GhostBusterService) {}

  @Get(':projectId')
  @ApiOperation({ summary: 'Get members flagged for inactivity' })
  getFlaggedMembers(@Param('projectId') projectId: string) {
    return this.ghostBusterService.getFlaggedMembers(projectId);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update ghost buster inactivity settings' })
  @ApiBody({ type: UpdateGhostBusterSettingsDto })
  updateSettings(@Body() body: UpdateGhostBusterSettingsDto) {
    return this.ghostBusterService.updateSettings(body.inactivityThreshold);
  }
}
