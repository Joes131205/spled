import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../utils/guards/jwt.guard';

@Controller('invitations')
@ApiTags('Invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get invitations for the authenticated user' })
  getMyInvitations(@Req() req: any) {
    const email = req.user.email;
    return this.invitationsService.getMyInvitations(email);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get invitation history for the authenticated user' })
  getInvitationHistory(@Req() req: any) {
    const email = req.user.email;
    return this.invitationsService.getInvitationHistory(email);
  }

  @Post(':invitationId/respond')
  @ApiOperation({ summary: 'Respond to an invitation' })
  respond(
    @Param('invitationId') invitationId: string,
    @Body('status') status: 'ACCEPTED' | 'DECLINED',
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.invitationsService.respond(invitationId, status, userId);
  }

  @Delete(':invitationId')
  @ApiOperation({ summary: 'Delete an invitation record' })
  delete(@Param('invitationId') invitationId: string, @Req() req: any) {
    const email = req.user.email;
    return this.invitationsService.deleteInvitation(invitationId, email);
  }

  @Delete('history/all')
  @ApiOperation({ summary: 'Clear all invitation history' })
  clearAll(@Req() req: any) {
    const email = req.user.email;
    return this.invitationsService.deleteAllHistory(email);
  }
}
