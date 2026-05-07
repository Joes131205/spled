import { Injectable, NotFoundException } from '@nestjs/common';
import { createProjectDto } from '../utils/dto/createProjectDto';
import { prisma } from '../db/prisma.client';

const db = prisma;
@Injectable()
export class ProjectsService {
  async createProject(body: createProjectDto) {
    const project = await db.project.create({
      data: {
        name: body.name,
        leaderId: body.leaderId,
        description: body.description,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });
    return project;
  }
  async getProjectById(id: string) {
    const project = await db.project.findUnique({
      where: { id: id },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async updateProject(projectId: string, body: createProjectDto) {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return db.project.update({ data: body, where: { id: projectId } });
  }

  async deleteProject(projectId: string) {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return db.project.delete({ where: { id: projectId } });
  }
}
