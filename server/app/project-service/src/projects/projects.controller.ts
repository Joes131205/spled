import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
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

  @Get('my')
  @ApiOperation({ summary: 'Get projects for the authenticated user' })
  getMyProjects(@Req() req: any) {
    const userId = req.user.userId;
    return this.projectsService.getMyProjects(userId);
  }

  @Post('')
  @ApiOperation({ summary: 'Create a new project' })
  @Roles('LEADER', 'MEMBER', 'LECTURER')
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
  @Roles('LEADER', 'MEMBER', 'LECTURER')
  updateProject(
    @Param('projectId') projectId: string,
    @Body() body: createProjectDto,
  ) {
    return this.projectsService.updateProject(projectId, body);
  }

  @Post(':projectId/invite')
  @ApiOperation({ summary: 'Invite a member to a project' })
  @Roles('LEADER', 'MEMBER')
  inviteMember(
    @Param('projectId') projectId: string,
    @Body() body: { email: string; taskName?: string; difficulty?: 'EASY' | 'MEDIUM' | 'HARD' },
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.projectsService.inviteMember(projectId, body, userId);
  }

  @Delete(':projectId/leave')
  @ApiOperation({ summary: 'Leave a project' })
  leaveProject(@Param('projectId') projectId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.projectsService.leaveProject(projectId, userId);
  }

  @Delete(':projectId/members/:memberId')
  @ApiOperation({ summary: 'Kick a member from a project' })
  @Roles('LEADER')
  kickMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.projectsService.kickMember(projectId, memberId);
  }

  @Delete(':projectId')
  @ApiOperation({ summary: 'Delete a project' })
  @Roles('LEADER', 'MEMBER', 'LECTURER')
  deleteProject(@Param('projectId') projectId: string) {
    return this.projectsService.deleteProject(projectId);
  }
}
