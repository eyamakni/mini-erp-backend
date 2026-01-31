import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EmployeePosition } from '../../../entities/user.entity';

export class ListEmployeesDto {
  @IsOptional() @IsEnum(EmployeePosition) position?: EmployeePosition;
  @IsOptional() @IsString() q?: string; // recherche nom/email
}
