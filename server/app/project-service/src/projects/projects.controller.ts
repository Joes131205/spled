import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { createProjectDto } from '../../utils/dto/createProjectDto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('')
  createProject(@Body() body: createProjectDto) {
    this.projectsService.createProject(body);
  }

  @Get(':id')
  getProjectById(@Param('id') id: string) {
    this.projectsService.getProjectById(id);
  }

  @Post('join/:id')
  joinToProject(@Param('id') id: string) {}

  @Delete(':id/:memberId')
  kickMember(@Param('id') id: string, @Param('memberId') memberId: string) {}
}
