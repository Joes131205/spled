import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { createProjectDto } from '../utils/dto/createProjectDto';
import { prisma } from '../db/prisma.client';

const db = prisma;
@Injectable()
export class ProjectsService {
  private async getUserRole(userId: string): Promise<string> {
    try {
      const response = await fetch(
        `http://localhost:3001/auth/users/${userId}`,
      );
      if (!response.ok) return 'MEMBER';
      const data: any = await response.json();
      return data.role || 'MEMBER';
    } catch (error) {
      console.error('[ProjectsService] Failed to fetch user role:', error);
      return 'MEMBER';
    }
  }

  async createProject(body: createProjectDto) {
    console.log(
      '[ProjectsService] Creating project with body:',
      JSON.stringify(body, null, 2),
    );
    const leaderRole = await this.getUserRole(body.leaderId);
    try {
      const project = await db.project.create({
        data: {
          name: body.name,
          leaderId: body.leaderId,
          description: body.description,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          members: {
            create: {
              userId: body.leaderId,
              role: leaderRole,
            },
          },
          invitations: {
            create: body.teamMembers
              ?.filter((_, index) => index !== 0)
              .map((member) => ({
                email: member.email,
                taskName: member.task,
                difficulty: member.difficulty.toUpperCase() as any,
                invitedBy: body.leaderId,
              })),
          },
          tasks:
            body.teamMembers && body.teamMembers.length > 0
              ? {
                  create: {
                    name: body.teamMembers[0].task,
                    weight: body.teamMembers[0].difficulty.toUpperCase() as any,
                    assignedTo: body.leaderId,
                    status: 'PENDING',
                  },
                }
              : undefined,
        },
        include: {
          invitations: true,
          members: true,
          tasks: true,
        },
      });
      return project;
    } catch (error) {
      console.error('[ProjectsService] Project creation failed:', error);
      throw error;
    }
  }

  async getMyProjects(userId: string) {
    const projects = await db.project.findMany({
      where: {
        members: { some: { userId: userId } },
      },
      include: {
        members: true,
        tasks: true,
      },
    });

    // Fetch roles for all members to ensure frontend can filter correctly
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        const enrichedMembers = await Promise.all(
          project.members.map(async (member) => {
            const role = await this.getUserRole(member.userId);
            return { ...member, role };
          }),
        );
        return { ...project, members: enrichedMembers };
      }),
    );

    return enrichedProjects;
  }
  async getProjectById(id: string) {
    const project = await db.project.findUnique({
      where: { id: id },
      include: {
        members: true,
        tasks: true,
        invitations: true,
        logReasons: true,
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Fetch roles for all members
    const enrichedMembers = await Promise.all(
      project.members.map(async (member) => {
        const role = await this.getUserRole(member.userId);
        return { ...member, role };
      }),
    );

    return { ...project, members: enrichedMembers };
  }

  async updateProject(
    projectId: string,
    body: createProjectDto,
    userId: string,
  ) {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.leaderId !== userId) {
      throw new ForbiddenException(
        'Only the project leader can update this project',
      );
    }

    const { teamMembers, ...updateData } = body;
    const data: any = { ...updateData };

    if (data.endDate) {
      data.endDate = new Date(data.endDate);
    }

    return db.project.update({
      data,
      where: { id: projectId },
    });
  }

  async inviteMember(
    projectId: string,
    body: {
      email: string;
      taskName?: string;
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    },
    userId: string,
  ) {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.leaderId !== userId) {
      throw new ForbiddenException(
        'Only the project leader can invite members',
      );
    }

    const invitation = await db.invitation.create({
      data: {
        projectId,
        email: body.email,
        taskName: body.taskName || 'TBD',
        difficulty: body.difficulty || 'MEDIUM',
        invitedBy: userId,
      },
    });

    return invitation;
  }

  async leaveProject(projectId: string, userId: string) {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const member = project.members.find((m) => m.userId === userId);
    if (!member)
      throw new NotFoundException('You are not a member of this project');

    return db.projectMember.delete({ where: { id: member.id } });
  }

  async kickMember(
    projectId: string,
    memberId: string,
    reason: string,
    userId: string,
  ) {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.leaderId !== userId) {
      throw new ForbiddenException('Only the project leader can kick members');
    }

    const member = await db.projectMember.findUnique({
      where: { id: memberId },
    });
    if (!member || member.projectId !== projectId) {
      throw new NotFoundException('Member not found in this project');
    }

    // Create log entry
    await db.logReason.create({
      data: {
        projectId,
        memberId: member.userId,
        reason: reason || 'No reason provided',
      },
    });

    return db.projectMember.delete({ where: { id: memberId } });
  }

  async deleteProject(projectId: string, userId: string) {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.leaderId !== userId) {
      throw new ForbiddenException(
        'Only the project leader can delete this project',
      );
    }

    return db.project.delete({ where: { id: projectId } });
  }
}
