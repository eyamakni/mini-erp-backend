import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly service: MeetingsService) {}

  // =========================
  // EMPLOYÉ: créer réunion
  // =========================
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req: any, @Body() dto: CreateMeetingDto) {
    return this.service.createByEmployee(req.user.userId, dto);
  }

  // =========================
  // EMPLOYÉ: voir mes réunions
  // =========================
  @UseGuards(AuthGuard('jwt'))
  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findMine(req.user.userId);
  }

  // =========================
  // EMPLOYÉ: détails réunion
  // =========================
  @UseGuards(AuthGuard('jwt'))
  @Get('mine/:id')
  getMine(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.getMineById(req.user.userId, id);
  }

  // =========================
  // EMPLOYÉ: modifier réunion
  // =========================
  @UseGuards(AuthGuard('jwt'))
  @Patch('mine/:id')
  updateMine(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMeetingDto,
  ) {
    return this.service.updateMine(req.user.userId, id, dto);
  }

  // =========================
  // EMPLOYÉ: annuler réunion
  // =========================
  @UseGuards(AuthGuard('jwt'))
  @Patch('mine/:id/cancel')
  cancelMine(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.cancelMine(req.user.userId, id);
  }
}
