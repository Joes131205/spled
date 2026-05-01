import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEvidenceDto } from '../utils/dto/createEvidenceDto';
import { prisma } from '../db/prisma.client';
import { VerifyEvidenceDto } from '../utils/dto/verifyEvidenceDto';

const db = prisma;
@Injectable()
export class EvidencesService {
  async uploadEvidence(taskId: string, body: CreateEvidenceDto) {
    if (!taskId) {
      throw new BadRequestException('Missing task id!');
    }

    if (!body.uploadedBy || !body.fileUrl) {
      throw new BadRequestException('uploadedBy and fileUrl are required');
    }

    return await db.evidence.create({
      data: {
        taskId,
        uploadedBy: body.uploadedBy,
        fileUrl: body.fileUrl,
        description: body.description ?? null,
      },
    });
  }

  getEvidenceByTask(taskId: string) {
    if (!taskId) {
      throw new BadRequestException('Missing task id!');
    }
    return db.evidence.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyEvidence(evidenceId: string, verifyEvidence: VerifyEvidenceDto) {
    if (!evidenceId) {
      throw new BadRequestException('Missing evidence id!');
    }

    const found = await db.evidence.findUnique({
      where: { id: evidenceId },
    });

    if (!found) {
      throw new NotFoundException('Evidence not found');
    }

    return db.evidence.update({
      data: {
        isVerified: verifyEvidence.isVerified,
        verifiedBy: verifyEvidence.verifiedBy,
        verificationNotes: verifyEvidence.verificationNotes ?? null,
        verificationDate: new Date(),
      },
      where: {
        id: evidenceId,
      },
    });
  }
}
