import { Controller, Get, Post, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('')
  async createTask(@Body() body: any) {}

  @Get(':projectId')
  async getTaskByProject(@Body() body: any) {}

  @Put(':id/status')
  async updateStatus(@Body() body: any) {}

  @Put(':id/weight')
  async updateWeight(@Body() body: any) {}
}
