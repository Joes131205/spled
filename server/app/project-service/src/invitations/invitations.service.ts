import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../db/prisma.client';

@Injectable()
export class InvitationsService {
  private async getUserRole(userId: string): Promise<string> {
    try {
      const response = await fetch(`http://localhost:3001/auth/users/${userId}`);
      if (!response.ok) return 'MEMBER';
      const data: any = await response.json();
      return data.role || 'MEMBER';
    } catch (error) {
      console.error('[InvitationsService] Failed to fetch user role:', error);
      return 'MEMBER';
    }
  }

  async getMyInvitations(email: string) {
    return prisma.invitation.findMany({
      where: { email, status: 'PENDING' },
      include: {
        project: {
          select: {
            name: true,
            description: true,
            leaderId: true,
            endDate: true,
          }
        }
      }
    });
  }

  async getInvitationHistory(email: string) {
    return prisma.invitation.findMany({
      where: { 
        email, 
        status: { in: ['ACCEPTED', 'DECLINED'] } 
      },
      include: {
        project: {
          select: {
            name: true,
            description: true,
            leaderId: true,
            endDate: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async respond(invitationId: string, status: 'ACCEPTED' | 'DECLINED', userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status }
    });

    if (status === 'ACCEPTED') {
      const role = await this.getUserRole(userId);
      await prisma.projectMember.create({
        data: {
          projectId: invitation.projectId,
          userId: userId,
          role: role,
        }
      });
      
      // Since we don't have direct access to user role here, 
      // we only create a task if the invitation is NOT for a lecturer.
      // We can infer this by checking if the task name is 'TBD' or similar.
      if (invitation.taskName !== 'TBD') {
        await prisma.task.create({
          data: {
            projectId: invitation.projectId,
            name: invitation.taskName,
            weight: invitation.difficulty,
            assignedTo: userId,
            status: 'PENDING'
          }
        });
      }
    }

    return updatedInvitation;
  }

  async deleteInvitation(invitationId: string, email: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation || invitation.email !== email) {
      throw new NotFoundException('Invitation not found');
    }

    return prisma.invitation.delete({
      where: { id: invitationId }
    });
  }

  async deleteAllHistory(email: string) {
    return prisma.invitation.deleteMany({
      where: { 
        email, 
        status: { in: ['ACCEPTED', 'DECLINED'] } 
      }
    });
  }
}
