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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { createProjectDto } from '../utils/dto/createProjectDto';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';
import { RolesGuard } from '../utils/guards/roles.guard';
import { Roles } from '../utils/decorators/roles.decorator';

@Controller('projects')
@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new project' })
  @Roles('LEADER')
  createProject(@Body() body: createProjectDto) {
    return this.projectsService.createProject(body);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get a project by id' })
  getProjectById(@Param('projectId') id: string) {
    return this.projectsService.getProjectById(id);
  }

  @Patch(':projectId')
  @ApiOperation({ summary: 'Update a project' })
  @Roles('LEADER')
  updateProject(
    @Param('projectId') projectId: string,
    @Body() body: createProjectDto,
  ) {
    return this.projectsService.updateProject(projectId, body);
  }

  @Delete(':projectId')
  @ApiOperation({ summary: 'Delete a project' })
  @Roles('LEADER')
  deleteProject(@Param('projectId') projectId: string) {
    return this.projectsService.deleteProject(projectId);
  }
}
