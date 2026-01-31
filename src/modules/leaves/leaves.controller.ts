import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeavesService } from './leaves.service';
import { RequestLeaveDto } from './dto/request-leave.dto';
import { LeaveStatus } from '../../entities/leave-request.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { AdminDecisionDto } from './dto/admin-decision.dto';

@Controller('leaves')
@UseGuards(AuthGuard('jwt'))
export class LeavesController {
  constructor(private leavesService: LeavesService) {}

  //  EMPLOYEE: demander congé
  @Post()
  requestLeave(@Req() req: any, @Body() dto: RequestLeaveDto) {
    return this.leavesService.requestLeave(req.user.userId, dto);
  }

  //  ADMIN: liste par status
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin')
  listByStatus(@Query('status') status: LeaveStatus) {
    return this.leavesService.listByStatus(status);
  }

  //  ADMIN: détails
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/:id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.leavesService.getOne(id);
  }

  //  ADMIN: approuver/refuser + commentaire
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/decision')
  decide(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminDecisionDto) {
    return this.leavesService.decide(id, dto);
  }
}
