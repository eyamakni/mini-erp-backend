import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { LeaveType } from '../../../entities/leave-request.entity';

export class RequestLeaveDto {
  @IsEnum(LeaveType)
  type: LeaveType;

  // format YYYY-MM-DD
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
