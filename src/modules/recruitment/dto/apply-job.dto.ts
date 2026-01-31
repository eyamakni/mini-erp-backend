import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ApplyJobDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEmail() email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  portfolioLink?: string;
}
