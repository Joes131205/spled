import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '../db/prisma.client';
import { TaskWeight, TaskStatus } from '../generated/prisma/client';

const db = prisma;

@Injectable()
export class TasksService {

  async createTask(projectId: string, body: {
    name: string;
    description?: string;
    weight?: string;
    assignedTo?: string;
    deadline?: string;
  }) {
    if (body.assignedTo) {
      const user = await db.user.findUnique({ where: { username: body.assignedTo } });
      if (!user) {
        throw new NotFoundException('User not found. Please enter a valid username.');
      }
      if (user.role === 'LECTURER') {
        throw new BadRequestException('You cannot assign tasks to a Lecturer!');
      }
    }

    return db.task.create({
      data: {
        projectId,
        name: body.name,
        description: body.description,
        weight: (body.weight as TaskWeight) ?? TaskWeight.MEDIUM,
        assignedTo: body.assignedTo,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
      },
    });
  }

  async getTaskById(id: string) {
    const task = await db.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async getTasksByProject(projectId: string) {
    return db.task.findMany({
      where: { projectId },
    });
  }

  async updateTask(id: string, body: {
    name?: string;
    description?: string;
    weight?: string;
    assignedTo?: string;
    deadline?: string;
  }) {
    await this.getTaskById(id);
    return db.task.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        weight: body.weight as TaskWeight,
        assignedTo: body.assignedTo,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
      },
    });
  }

  async updateStatus(id: string, status: string, progress: number) {
    await this.getTaskById(id);
    return db.task.update({
      where: { id },
      data: {
        status: status as TaskStatus,
        progress,
      },
    });
  }

  async deleteTask(id: string) {
    await this.getTaskById(id);
    return db.task.delete({ where: { id } });
  }

  async getAnalytics(projectId: string) {
    const tasks = await this.getTasksByProject(projectId);
    const weightMap: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };
    const contributionMap: Record<string, number> = {};

    tasks.forEach((task) => {
      if (task.assignedTo && task.status === TaskStatus.DONE) {
        const weight = weightMap[task.weight] ?? 1;
        contributionMap[task.assignedTo] = (contributionMap[task.assignedTo] || 0) + weight;
      }
    });

    const total = Object.values(contributionMap).reduce((a, b) => a + b, 0);
    return Object.entries(contributionMap).map(([name, score]) => ({
      name,   // ← changed from userId to name
      score,
      percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    }));
  }
}