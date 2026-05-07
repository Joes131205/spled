import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { createTaskDto } from '../utils/dto/createTaskDto';
import { updateStatusDto } from '../utils/dto/updateStatusDto';
import { updateWeightDto } from '../utils/dto/updateWeightDto';
import { assignTaskDto } from '../utils/dto/assignTaskDto';
import { unassignTaskDto } from '../utils/dto/unassignTaskDto';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';
import { RolesGuard } from '../utils/guards/roles.guard';
import { Roles } from '../utils/decorators/roles.decorator';

@Controller('tasks')
@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a task for a project' })
  @Roles('LEADER')
  createTask(@Body() body: createTaskDto) {
    return this.tasksService.createTask(body);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get tasks by project id' })
  getTaskByProject(@Param('projectId') projectId: string) {
    return this.tasksService.getTaskByProject(projectId);
  }

  @Get(':taskId/assignments')
  @ApiOperation({ summary: 'Get task assignments' })
  @Roles('LEADER')
  getTaskAssignments(@Param('taskId') taskId: string) {
    return this.tasksService.getTaskAssignments(taskId);
  }

  @Put(':taskId/status')
  @ApiOperation({ summary: 'Update task status' })
  @Roles('LEADER', 'MEMBER')
  updateStatus(@Param('taskId') taskId: string, @Body() body: updateStatusDto) {
    return this.tasksService.updateStatus(taskId, body);
  }

  @Put(':taskId/weight')
  @ApiOperation({ summary: 'Update task weight' })
  @Roles('LEADER')
  updateWeight(@Param('taskId') taskId: string, @Body() body: updateWeightDto) {
    return this.tasksService.updateWeight(taskId, body);
  }

  @Put(':taskId/assign')
  @ApiOperation({ summary: 'Assign a task to a member' })
  @Roles('LEADER')
  assignTask(@Param('taskId') taskId: string, @Body() body: assignTaskDto) {
    return this.tasksService.assignTask(taskId, body);
  }

  @Put(':taskId/unassign')
  @ApiOperation({ summary: 'Unassign a task from a member' })
  @Roles('LEADER')
  unassignTask(@Param('taskId') taskId: string, @Body() body: unassignTaskDto) {
    return this.tasksService.unassignTask(taskId, body);
  }
}
