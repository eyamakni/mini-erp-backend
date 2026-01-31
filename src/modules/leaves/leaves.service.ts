import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest, LeaveStatus } from '../../entities/leave-request.entity';
import { User } from '../../entities/user.entity';
import { RequestLeaveDto } from './dto/request-leave.dto';
import { AdminDecisionDto } from './dto/admin-decision.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRepo: Repository<LeaveRequest>,
    private mailService: MailService, 
  ) {}

//  Employé demande un congé
async requestLeave(employeeUserId: number, dto: RequestLeaveDto) {
  const start = new Date(dto.startDate);
  const end = new Date(dto.endDate);
  if (end < start) {
    throw new BadRequestException('endDate must be after startDate');
  }

  const leave = this.leaveRepo.create({
    employee: { id: employeeUserId } as any,
    type: dto.type,
    startDate: dto.startDate,
    endDate: dto.endDate,
    reason: dto.reason ?? null,
    status: LeaveStatus.PENDING,
    adminComment: null,
  });

  const saved = await this.leaveRepo.save(leave);

  //  Notification Admin
  if (process.env.MAIL_USER) {
    await this.mailService.sendAdminNewLeaveEmail({
      to: process.env.MAIL_USER,
      leaveId: saved.id,
      employeeUserId,
      startDate: saved.startDate,
      endDate: saved.endDate,
      type: saved.type,
    });
  }

  
  return this.leaveRepo.findOne({
    where: { id: saved.id },
    relations: ['employee'],
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      status: true,
      reason: true,
      adminComment: true,
      createdAt: true,
      employee: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
  });
}


  
async listByStatus(status: LeaveStatus) {
  return this.leaveRepo.find({
    where: { status },
    relations: ['employee'],
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      status: true,
      reason: true,
      createdAt: true,
      employee: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
    order: { createdAt: 'DESC' },
  });
}


  
async getOne(id: number) {
  const leave = await this.leaveRepo.findOne({
    where: { id },
    relations: ['employee'],
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      status: true,
      reason: true,
      adminComment: true,
      createdAt: true,
      employee: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
  });

  if (!leave) {
    throw new NotFoundException('Leave request not found');
  }

  const days = this.calculateDays(leave.startDate, leave.endDate);

  return {
    ...leave,
    days,
  };
}
async findMine(employeeUserId: number) {
  return this.leaveRepo.find({
    where: { employee: { id: employeeUserId } as any },
    order: { createdAt: 'DESC' },
  });
}


  async decide(id: number, dto: AdminDecisionDto) {
    if (dto.decision === LeaveStatus.PENDING) {
      throw new BadRequestException('Decision must be APPROVED or REJECTED');
    }

    const leave = await this.leaveRepo.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!leave) throw new NotFoundException('Leave request not found');

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request already processed');
    }

    leave.status = dto.decision;
    leave.adminComment = dto.comment ?? null;

    const saved = await this.leaveRepo.save(leave);

    const employeeEmail = leave.employee.personalEmail ?? leave.employee.email;
    await this.mailService.sendLeaveDecisionEmail({
      to: employeeEmail,
      fullName: `${leave.employee.firstName} ${leave.employee.lastName}`,
      status: leave.status,
      startDate: leave.startDate,
      endDate: leave.endDate,
      comment: leave.adminComment ?? undefined,
    });

    return saved;
  }

  private calculateDays(startDate: string, endDate: string) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diff + 1; 
  }
}
