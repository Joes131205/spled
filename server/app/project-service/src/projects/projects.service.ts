import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { createProjectDto } from '../utils/dto/createProjectDto';
import { prisma } from '../db/prisma.client';

const db = prisma;

@Injectable()
export class ProjectsService {

  async createProject(body: createProjectDto & { leaderId: string }) {
    return db.project.create({ data: body });
  }

  async getProjectById(id: string) {
    const project = await db.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async getProjectsByLeader(leaderId: string) {
    return db.project.findMany({ where: { leaderId } });
  }

  async getAllProjects() {
    return db.project.findMany();
  }

  async updateProject(id: string, name: string, description: string) {
    await this.getProjectById(id);
    return db.project.update({ where: { id }, data: { name, description } });
  }

  async deleteProject(id: string) {
    await this.getProjectById(id);
    return db.project.delete({ where: { id } });
  }

  async joinToProject(projectId: string, userId: string) {
    await this.getProjectById(projectId);
    return db.projectMember.create({ data: { projectId, userId } });
  }

  async kickMember(projectId: string, memberId: string, reason: string) {
    await this.getProjectById(projectId);
    await db.projectMember.delete({
      where: { projectId_userId: { projectId, userId: memberId } },
    });
    return db.logReason.create({ data: { projectId, memberId, reason } });
  }

  async getMembers(projectId: string) {
    const project = await this.getProjectById(projectId);
    const members = await db.projectMember.findMany({ where: { projectId } });

    // Enrich regular members
    const enriched = await Promise.all(
      members.map(async (m) => {
        const user = await db.user.findUnique({
          where: { id: m.userId },
          select: { id: true, username: true, displayName: true, avatarUrl: true, role: true },
        });
        return { ...m, isLeader: false, user };
      })
    );

    // Prepend the leader
    const leader = await db.user.findUnique({
      where: { id: project.leaderId },
      select: { id: true, username: true, displayName: true, avatarUrl: true, role: true },
    });

    return [
      { userId: project.leaderId, projectId, isLeader: true, user: leader },
      ...enriched.filter(m => m.userId !== project.leaderId), // avoid duplicate if leader is also in members table
    ];
  }

  async getKickLog(projectId: string) {
    await this.getProjectById(projectId);
    const logs = await db.logReason.findMany({
      where: { projectId },
      orderBy: { kickedAt: 'desc' },
    });
    // Enrich with username
    const enriched = await Promise.all(
      logs.map(async (log) => {
        const user = await db.user.findUnique({
          where: { id: log.memberId },
          select: { username: true, displayName: true, avatarUrl: true },
        });
        return { ...log, user };
      })
    );
    return enriched;
  }

  async getProjectsByMember(userId: string) {
    const memberships = await db.projectMember.findMany({ where: { userId } });
    const projectIds = memberships.map(m => m.projectId);
    return db.project.findMany({ where: { id: { in: projectIds } } });
  }

  async inviteMember(projectId: string, username: string) {
    await this.getProjectById(projectId);
    const user = await db.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const existingInvite = await db.projectInvite.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } }
    });
    if (existingInvite) {
      throw new BadRequestException('This user has already been invited to this project!');
    }

    return db.projectInvite.create({
      data: { projectId, userId: user.id, status: 'PENDING' },
    });
  }

  async acceptInvite(projectId: string, userId: string) {
    await db.projectInvite.update({
      where: { projectId_userId: { projectId, userId } },
      data: { status: 'ACCEPTED' },
    });
    return this.joinToProject(projectId, userId);
  }

  async getPendingInvites(userId: string) {
    return db.projectInvite.findMany({
      where: { userId, status: 'PENDING' },
      include: { project: true }
    });
  }
}