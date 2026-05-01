import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EvidencesService } from './evidences.service';

@Controller('evidence')
export class EvidencesController {
  constructor(private readonly evidencesService: EvidencesService) {}

  @Post(':taskId')
  uploadEvidence(
    @Param('taskId') taskId: string,
    @Body() body: {
      url: string;
      submittedBy: string;
      description?: string;
    },
  ) {
    return this.evidencesService.uploadEvidence(taskId, body);
  }

  @Get(':taskId')
  getEvidenceByTask(@Param('taskId') taskId: string) {
    return this.evidencesService.getEvidenceByTask(taskId);
  }

  @Post(':id/verify')
  verifyEvidence(
    @Param('id') evidenceId: string,
    @Body() body: {
      reviewerId: string;
      isValid: boolean;
      notes?: string;
    },
  ) {
    return this.evidencesService.verifyEvidence(evidenceId, body);
  }
}