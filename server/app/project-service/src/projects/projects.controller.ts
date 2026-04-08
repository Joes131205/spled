import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('')
  async createProject(@Body() body: any) {}

  @Get(':id')
  async gerProjectById(@Body() body: any) {}

  @Post('join/:id')
  async joinToProject(@Body() body: any) {}

  @Delete(':id/:memberId')
  async kickMember(@Body() body: any) {}
}
