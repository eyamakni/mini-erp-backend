import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startAt: string; // ISO

  @IsInt()
  durationMinutes: number;

  @IsArray()
  participantIds: number[];
}
