import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createProjectDto } from '../../utils/dto/createProjectDto';

@Injectable()
export class ProjectsService {
  async createProject(body: createProjectDto) {
    const project = await prisma.projects.create({
      data: body,
    });
    return project;
  }
  async getProjectById(id: string) {
    const project = await prisma.projects.findUnique({
      where: { id: id },
    });
    if (!project) {
      throw new UnauthorizedException('Project not found');
    }
    return project;
  }
  async joinToProject() {}
  async kickMember() {}
}
