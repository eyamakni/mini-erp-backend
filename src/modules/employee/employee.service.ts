import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LeaveRequest, LeaveStatus } from '../../entities/leave-request.entity';
import { Meeting } from '../../entities/meeting.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRepo: Repository<LeaveRequest>,

    @InjectRepository(Meeting)
    private readonly meetingRepo: Repository<Meeting>,
  ) {}

 
  async getEmployeeDashboard(userId: number) {
    // ===== 1) Leaves stats =====
    const rawLeaves = await this.leaveRepo
      .createQueryBuilder('l')
      .select('l.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('l.employeeId = :id', { id: userId })
      .groupBy('l.status')
      .getRawMany();

    const leaveRequestsByStatus = { pending: 0, approved: 0, rejected: 0 };

    for (const r of rawLeaves) {
      const count = Number(r.count);
      if (r.status === LeaveStatus.PENDING) leaveRequestsByStatus.pending = count;
      if (r.status === LeaveStatus.APPROVED) leaveRequestsByStatus.approved = count;
      if (r.status === LeaveStatus.REJECTED) leaveRequestsByStatus.rejected = count;
    }

    const leaveRequestsCount =
      leaveRequestsByStatus.pending +
      leaveRequestsByStatus.approved +
      leaveRequestsByStatus.rejected;

    const now = new Date();

   const upcomingMeetingsCount = await this.meetingRepo
  .createQueryBuilder('m')
  .innerJoin('m.participants', 'p', 'p.id = :id', { id: userId })
  .andWhere('m.isActive = true')
  .andWhere('m.startAt >= :now', { now })
  .distinct(true)
  .getCount();


    const upcomingMeetings = await this.meetingRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.participants', 'p')
      .where('p.id = :id', { id: userId })
      .andWhere('m.isActive = true')
      .andWhere('m.startAt >= :now', { now })
      .orderBy('m.startAt', 'ASC')
      .take(5)
      .getMany();

    return {
      leavesRemaining: null,
      leaveRequestsByStatus,
      leaveRequestsCount,
      upcomingMeetingsCount,
      upcomingMeetings,
    };
  }
}
