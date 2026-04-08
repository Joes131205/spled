import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { GhostBusterService } from './ghost-buster.service';

@Controller('ghost-buster')
export class GhostBusterController {
  constructor(private readonly ghostBusterService: GhostBusterService) {}

  @Get(':projectId')
  getFlaggedMembers(@Param('projectId') projectId: string) {
    return this.ghostBusterService.getFlaggedMembers(projectId);
  }

  @Patch('settings')
  updateSettings(@Body() body: { inactivityThreshold?: string }) {
    return this.ghostBusterService.updateSettings(body.inactivityThreshold);
  }
}
