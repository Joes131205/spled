import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { createProjectDto } from '../utils/dto/createProjectDto';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';
import { RolesGuard } from '../utils/guards/roles.guard';
import { Roles } from '../utils/decorators/roles.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LEADER')
  createProject(@Body() body: createProjectDto) {
    return this.projectsService.createProject(body);
  }

  @Get(':projectId')
  getProjectById(@Param('projectId') id: string) {
    return this.projectsService.getProjectById(id);
  }

  @Patch(':projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LEADER')
  updateProject(@Param('projectId') projectId: string, @Body() body: unknown) {
    return this.projectsService.updateProject(projectId, body);
  }

  @Delete(':projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LEADER')
  deleteProject(@Param('projectId') projectId: string) {
    return this.projectsService.deleteProject(projectId);
  }
}
