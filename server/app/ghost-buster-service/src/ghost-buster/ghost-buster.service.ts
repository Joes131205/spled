import { Injectable } from '@nestjs/common';

@Injectable()
export class GhostBusterService {
  private inactivityThreshold = 'H-3';

  private readonly flaggedByProject = new Map<string, string[]>([
    ['default-project', ['member-a', 'member-b']],
  ]);

  getFlaggedMembers(projectId: string) {
    return {
      projectId,
      inactivityThreshold: this.inactivityThreshold,
      flaggedMembers: this.flaggedByProject.get(projectId) ?? [],
    };
  }

  updateSettings(inactivityThreshold?: string) {
    if (inactivityThreshold) {
      this.inactivityThreshold = inactivityThreshold;
    }

    return {
      inactivityThreshold: this.inactivityThreshold,
      message: 'Ghost buster settings updated',
    };
  }
}
