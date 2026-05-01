import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { createProjectDto } from '../utils/dto/createProjectDto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('')
  createProject(@Body() body: createProjectDto) {
    return this.projectsService.createProject(body);
  }

  @Get(':projectId')
  getProjectById(@Param('projectId') id: string) {
    return this.projectsService.getProjectById(id);
  }

  @Patch(':projectId')
  updateProject(@Param('id') projectId: string) {
    return this.projectsService.updateProject(projectId);
  }

  @Delete(':projectId')
  deleteProject(@Param('id') projectId: string) {
    return this.projectsService.deleteProject(projectId);
  }
}
