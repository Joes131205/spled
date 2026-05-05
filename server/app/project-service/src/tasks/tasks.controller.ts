import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { createTaskDto } from '../utils/dto/createTaskDto';
import { updateStatusDto } from '../utils/dto/updateStatusDto';
import { updateWeightDto } from '../utils/dto/updateWeightDto';
import { assignTaskDto } from '../utils/dto/assignTaskDto';
import { unassignTaskDto } from '../utils/dto/unassignTaskDto';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('')
  createTask(@Body() body: createTaskDto) {
    return this.tasksService.createTask(body);
  }

  @Get(':projectId')
  getTaskByProject(@Param('projectId') projectId: string) {
    return this.tasksService.getTaskByProject(projectId);
  }

  @Get(':taskId/assignments')
  getTaskAssignments(@Param('taskId') taskId: string) {
    return this.tasksService.getTaskAssignments(taskId);
  }

  @Put(':taskId/status')
  updateStatus(@Param('taskId') taskId: string, @Body() body: updateStatusDto) {
    return this.tasksService.updateStatus(taskId, body);
  }

  @Put(':taskId/weight')
  updateWeight(@Param('taskId') taskId: string, @Body() body: updateWeightDto) {
    return this.tasksService.updateWeight(taskId, body);
  }

  @Put(':taskId/assign')
  assignTask(@Param('taskId') taskId: string, @Body() body: assignTaskDto) {
    return this.tasksService.assignTask(taskId, body);
  }

  @Put(':taskId/unassign')
  @UseGuards(JwtAuthGuard)
  unassignTask(@Param('taskId') taskId: string, @Body() body: unassignTaskDto) {
    return this.tasksService.unassignTask(taskId, body);
  }
}
