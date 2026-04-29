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
  async createProject(@Body() body: createProjectDto) {
    await this.projectsService.createProject(body);
  }

  @Get(':projectId')
  async getProjectById(@Param('projectId') id: string) {
    await this.projectsService.getProjectById(id);
  }

  @Patch(':projectId')
  async updateProject(@Param('id') projectId: string) {}

  @Delete(':projectId')
  async deleteProject(@Param('id') projectId: string) {}

  @Post(':projectId/join')
  async joinToProject(@Param('projectId') projectId: string) {}

  @Delete(':projectId/members/:memberId')
  async kickMember(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
  ) {}

  @Get(':projectId/members')
  getMembers(@Param('id') projectId: string) {}
}
