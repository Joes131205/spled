import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { createProjectDto } from '../../utils/dto/createUserDto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('')
  async createProject(@Body() body: createProjectDto) {}

  @Get(':id')
  async gerProjectById(@Param("id") id: string) {}

  @Post('join/:id')
  async joinToProject(@Param("id") id: string) {}

  @Delete(':id/:memberId')
  async kickMember(@Param("id") id: string, @Param("memberId") memberId: string) {}
}
