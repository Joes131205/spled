import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EvidencesService } from './evidences.service';
import { CreateEvidenceDto } from '../utils/dto/createEvidenceDto';
import { VerifyEvidenceDto } from '../utils/dto/verifyEvidenceDto';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';
@Controller()
@UseGuards(JwtAuthGuard)
export class EvidencesController {
  constructor(private readonly evidencesService: EvidencesService) {}

  @Post('evidence/:taskId')
  uploadEvidence(
    @Param('taskId') taskId: string,
    @Body() body: CreateEvidenceDto,
  ) {
    return this.evidencesService.uploadEvidence(taskId, body);
  }

  @Get('evidence/:taskId')
  getEvidenceByTask(@Param('taskId') taskId: string) {
    return this.evidencesService.getEvidenceByTask(taskId);
  }

  @Put('evidence/:evidenceId/verify')
  verifyEvidence(
    @Param('evidenceId') evidenceId: string,
    @Body() verifyEvidence: VerifyEvidenceDto,
  ) {
    return this.evidencesService.verifyEvidence(evidenceId, verifyEvidence);
  }
}
