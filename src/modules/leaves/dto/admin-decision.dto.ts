import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveStatus } from '../../../entities/leave-request.entity';

export class AdminDecisionDto {
  @IsEnum(LeaveStatus)
  decision: LeaveStatus; // APPROVED ou REJECTED

  @IsOptional()
  @IsString()
  comment?: string;
}
