import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { createTaskDto } from '../utils/dto/createTaskDto';
import { prisma } from '../db/prisma.client';
import { updateStatusDto } from '../utils/dto/updateStatusDto';
import { updateWeightDto } from '../utils/dto/updateWeightDto';
import { assignTaskDto } from '../utils/dto/assignTaskDto';
import { unassignTaskDto } from '../utils/dto/unassignTaskDto';

const db = prisma;
@Injectable()
export class TasksService {
  async createTask(body: createTaskDto) {
    return await db.task.create({
      data: body,
    });
  }

  async getTaskById(taskId: string) {
    const task = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async getTaskByProject(projectId: string) {
    const tasks = await db.task.findMany({ where: { projectId: projectId } });
    return tasks;
  }

  async getTaskAssignments(taskId: string) {
    await this.getTaskById(taskId);

    return db.taskAssignment.findMany({
      where: { taskId },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async updateStatus(taskId: string, body: updateStatusDto) {
    return db.task.update({
      where: { id: taskId },
      data: {
        status: body.status,
      },
    });
  }

  async updateWeight(taskId: string, body: updateWeightDto) {
    return db.task.update({
      where: { id: taskId },
      data: {
        weight: body.weight,
      },
    });
  }

  async assignTask(taskId: string, body: assignTaskDto) {
    await this.getTaskById(taskId);

    const updated = await db.task.update({
      where: { id: taskId },
      data: {
        assignedTo: body.memberId,
      },
    });

    await db.taskAssignment.create({
      data: {
        taskId: taskId,
        memberId: body.memberId,
        assignedBy: body.assignedBy ?? null,
        reason: body.reason ?? null,
      },
    });

    return updated;
  }

  async unassignTask(taskId: string, body: unassignTaskDto) {
    const task = await this.getTaskById(taskId);

    if (!task.assignedTo) {
      throw new BadRequestException('Task is not currently assigned');
    }

    const previousMember = task.assignedTo;

    const updated = await db.task.update({
      where: { id: taskId },
      data: { assignedTo: null },
    });

    await db.taskAssignment.create({
      data: {
        taskId: taskId,
        memberId: previousMember,
        assignedBy: body.assignedBy ?? null,
        reason: body.reason ?? 'unassigned',
      },
    });

    return updated;
  }
}
