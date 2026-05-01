import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { createTaskDto } from '../utils/dto/createTaskDto';
import { TaskWeight } from '../generated/prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post(':projectId')
  createTask(
    @Param('projectId') projectId: string,
    @Body() body: createTaskDto,
  ) {
    return this.tasksService.createTask(projectId, body);
  }

  @Put(':id/weight')
  updateWeight(
    @Param('id') id: string,
    @Body() body: { weight: 'EASY' | 'MEDIUM' | 'HARD' },
  ) {
    return this.tasksService.updateTask(id, { weight: body.weight as TaskWeight });
  }

  @Get(':projectId/analytics')
  getAnalytics(@Param('projectId') projectId: string) {
    return this.tasksService.getAnalytics(projectId);
  }

  @Get(':projectId')
  getTasksByProject(@Param('projectId') projectId: string) {
    return this.tasksService.getTasksByProject(projectId);
  }

  @Patch(':id')
  updateTask(
    @Param('id') id: string,
    @Body() body: Partial<createTaskDto>,
  ) {
    return this.tasksService.updateTask(id, body);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'PENDING' | 'IN_PROGRESS' | 'DONE'; progress: number },
  ) {
    return this.tasksService.updateStatus(id, body.status, body.progress);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }
}