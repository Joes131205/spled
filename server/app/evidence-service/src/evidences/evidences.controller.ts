import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EvidencesService } from './evidences.service';

@Controller()
export class EvidencesController {
  constructor(private readonly evidencesService: EvidencesService) {}

  @Post('evidence/:taskId')
  uploadEvidence(
    @Param('taskId') taskId: string,
    @Body() body: { url?: string; screenshot?: string; submittedBy?: string },
  ) {
    return this.evidencesService.uploadEvidence(taskId, body);
  }

  @Get('evidence/:taskId')
  getEvidenceByTask(@Param('taskId') taskId: string) {
    return this.evidencesService.getEvidenceByTask(taskId);
  }

  @Post('evidence/:id/verify')
  verifyEvidence(
    @Param('id') evidenceId: string,
    @Body() body: { reviewerId?: string; isValid?: boolean; notes?: string },
  ) {
    return this.evidencesService.verifyEvidence(evidenceId, body);
  }

  @Get('analytics/:projectId')
  getProjectAnalytics(@Param('projectId') projectId: string) {
    return this.evidencesService.getProjectAnalytics(projectId);
  }

  @Get('analytics/public/:token')
  getPublicAnalytics(@Param('token') token: string) {
    return this.evidencesService.getPublicAnalytics(token);
  }
}
