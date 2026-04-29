import { Injectable } from '@nestjs/common';

@Injectable()
export class GhostBusterService {
  getFlaggedMembers(projectId: string) {}

  updateSettings(inactivityThreshold?: string) {}
}
