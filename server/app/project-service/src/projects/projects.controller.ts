import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { createProjectDto } from '../utils/dto/createProjectDto';
import { createLogReasonDto } from '../utils/dto/createLogReasonDto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() body: createProjectDto & { leaderId: string }) {
    return this.projectsService.createProject(body);
  }

  @Get()
  getProjects(
    @Query('leaderId') leaderId?: string,
    @Query('memberId') memberId?: string,
  ) {
    if (leaderId) return this.projectsService.getProjectsByLeader(leaderId);
    if (memberId) return this.projectsService.getProjectsByMember(memberId);
    return this.projectsService.getAllProjects();
  }

  @Get('invites/:userId')
  getPendingInvites(@Param('userId') userId: string) {
    return this.projectsService.getPendingInvites(userId);
  }

  @Get(':projectId/members')
  getMembers(@Param('projectId') projectId: string) {
    return this.projectsService.getMembers(projectId);
  }

  @Get(':projectId/kick-log')
  getKickLog(@Param('projectId') projectId: string) {
    return this.projectsService.getKickLog(projectId);
  }

  @Get(':projectId')
  getProjectById(@Param('projectId') id: string) {
    return this.projectsService.getProjectById(id);
  }

  @Patch(':projectId')
  updateProject(
    @Param('projectId') id: string,
    @Body() body: { name: string; description: string },
  ) {
    return this.projectsService.updateProject(id, body.name, body.description);
  }

  @Delete(':projectId')
  deleteProject(@Param('projectId') id: string) {
    return this.projectsService.deleteProject(id);
  }

  @Delete(':projectId/members/:memberId')
  kickMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body() body: createLogReasonDto,
  ) {
    return this.projectsService.kickMember(projectId, memberId, body.reason);
  }

  @Post(':projectId/invite')
  inviteMember(
    @Param('projectId') projectId: string,
    @Body() body: { username: string },
  ) {
    return this.projectsService.inviteMember(projectId, body.username);
  }

  @Post(':projectId/accept-invite')
  acceptInvite(
    @Param('projectId') projectId: string,
    @Body() body: { userId: string },
  ) {
    return this.projectsService.acceptInvite(projectId, body.userId);
  }
}