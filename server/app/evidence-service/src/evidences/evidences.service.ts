import { Injectable } from '@nestjs/common';

@Injectable()
export class EvidencesService {
  uploadEvidence() {}

  getEvidenceByTask(taskId: string) {}

  verifyEvidence() {}

  getProjectAnalytics(projectId: string) {}

  getPublicAnalytics(token: string) {}
}
