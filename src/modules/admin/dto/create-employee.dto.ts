import { IsEmail, IsEnum, IsString } from 'class-validator';
import { EmployeePosition } from '../../../entities/user.entity';

export class CreateEmployeeDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEmail() personalEmail: string;
  @IsEnum(EmployeePosition) position: EmployeePosition;
}
