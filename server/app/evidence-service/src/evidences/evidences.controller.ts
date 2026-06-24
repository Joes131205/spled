import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EvidencesService } from './evidences.service';
import { CreateEvidenceDto } from '../utils/dto/createEvidenceDto';
import { VerifyEvidenceDto } from '../utils/dto/verifyEvidenceDto';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';
import { RolesGuard } from '../utils/guards/roles.guard';
import { Roles } from '../utils/decorators/roles.decorator';

type AuthenticatedRequest = Request & {
  user: { userId: string; role: string };
};

@Controller()
@ApiTags('Evidences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvidencesController {
  constructor(private readonly evidencesService: EvidencesService) {}

  @Post('evidence/:taskId')
  @ApiOperation({ summary: 'Upload evidence for a task' })
  @Roles('LEADER', 'MEMBER')
  uploadEvidence(
    @Param('taskId') taskId: string,
    @Body() body: CreateEvidenceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.evidencesService.uploadEvidence(taskId, body, req.user.userId);
  }

  @Get('evidence/:taskId')
  @ApiOperation({ summary: 'Get evidence by task id' })
  @Roles('LEADER', 'MEMBER', 'LECTURER')
  getEvidenceByTask(@Param('taskId') taskId: string) {
    return this.evidencesService.getEvidenceByTask(taskId);
  }

  @Put('evidence/:evidenceId/verify')
  @ApiOperation({ summary: 'Verify evidence as project leader or peer member' })
  @Roles('LEADER', 'MEMBER')
  verifyEvidence(
    @Param('evidenceId') evidenceId: string,
    @Body() verifyEvidence: VerifyEvidenceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.evidencesService.verifyEvidence(
      evidenceId,
      verifyEvidence,
      req.user.userId,
    );
  }
}
