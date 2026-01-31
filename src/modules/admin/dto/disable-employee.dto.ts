import { IsOptional, IsString } from 'class-validator';

export class DisableEmployeeDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
