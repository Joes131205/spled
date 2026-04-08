import { Injectable } from '@nestjs/common';

@Injectable()
export class EvidencesService {
  private readonly evidences = new Map<
    string,
    {
      id: string;
      taskId: string;
      url?: string;
      screenshot?: string;
      submittedBy?: string;
      submittedAt: string;
      verification?: {
        reviewerId?: string;
        isValid?: boolean;
        notes?: string;
        verifiedAt: string;
      };
    }
  >();

  private readonly evidenceIdsByTask = new Map<string, string[]>();
  private readonly publicAnalyticsToken = new Map<string, string>();

  uploadEvidence(
    taskId: string,
    payload: { url?: string; screenshot?: string; submittedBy?: string },
  ) {
    const id = `ev-${this.evidences.size + 1}`;
    const evidence = {
      id,
      taskId,
      url: payload.url,
      screenshot: payload.screenshot,
      submittedBy: payload.submittedBy,
      submittedAt: new Date().toISOString(),
    };

    this.evidences.set(id, evidence);

    const existingIds = this.evidenceIdsByTask.get(taskId) ?? [];
    this.evidenceIdsByTask.set(taskId, [...existingIds, id]);

    return evidence;
  }

  getEvidenceByTask(taskId: string) {
    const evidenceIds = this.evidenceIdsByTask.get(taskId) ?? [];
    return evidenceIds
      .map((evidenceId) => this.evidences.get(evidenceId))
      .filter((evidence) => evidence !== undefined);
  }

  verifyEvidence(
    evidenceId: string,
    payload: { reviewerId?: string; isValid?: boolean; notes?: string },
  ) {
    const evidence = this.evidences.get(evidenceId);
    if (!evidence) {
      return { message: 'Evidence not found', evidenceId };
    }

    const updatedEvidence = {
      ...evidence,
      verification: {
        reviewerId: payload.reviewerId,
        isValid: payload.isValid,
        notes: payload.notes,
        verifiedAt: new Date().toISOString(),
      },
    };

    this.evidences.set(evidenceId, updatedEvidence);
    return updatedEvidence;
  }

  getProjectAnalytics(projectId: string) {
    const allEvidences = [...this.evidences.values()];
    const verified = allEvidences.filter(
      (evidence) => evidence.verification?.isValid === true,
    ).length;
    const unverified = allEvidences.length - verified;

    return {
      projectId,
      chart: {
        type: 'pie',
        labels: ['Verified', 'Unverified'],
        data: [verified, unverified],
      },
      totals: {
        evidences: allEvidences.length,
        verified,
        unverified,
      },
    };
  }

  getPublicAnalytics(token: string) {
    const projectId = this.publicAnalyticsToken.get(token) ?? 'public-project';
    return {
      token,
      readOnly: true,
      ...this.getProjectAnalytics(projectId),
    };
  }
}
