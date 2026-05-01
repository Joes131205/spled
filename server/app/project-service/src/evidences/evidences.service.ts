import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../db/prisma.client';

const db = prisma;

@Injectable()
export class EvidencesService {

  async uploadEvidence(
    taskId: string,
    body: {
      url: string;
      submittedBy: string;
      description?: string;
    },
  ) {
    return db.evidence.create({
      data: {
        taskId,
        uploadedBy: body.submittedBy,
        fileUrl: body.url,
        description: body.description,
      },
    });
  }

  async getEvidenceByTask(taskId: string) {
    return db.evidence.findMany({
      where: { taskId },
    });
  }

  async verifyEvidence(
    evidenceId: string,
    body: {
      reviewerId: string;
      isValid: boolean;
      notes?: string;
    },
  ) {
    const evidence = await db.evidence.findUnique({
      where: { id: evidenceId },
    });
    if (!evidence) throw new NotFoundException('Evidence not found');

    return db.evidence.update({
      where: { id: evidenceId },
      data: {
        isVerified: body.isValid,
        verifiedBy: body.reviewerId,
        verificationNotes: body.notes,
        verificationDate: new Date(),
      },
    });
  }

  async getProjectAnalytics(projectId: string) {
    const evidences = await db.evidence.findMany({
      where: { taskId: projectId },
    });

    const total = evidences.length;
    const verified = evidences.filter((e) => e.isVerified).length;

    return {
      total,
      verified,
      unverified: total - verified,
    };
  }

  async getPublicAnalytics(token: string) {
    return { message: 'Public analytics coming soon', token };
  }
}