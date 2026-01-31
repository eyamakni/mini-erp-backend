import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JobContractType } from '../../../entities/job-offer.entity';

export class CreateJobOfferDto {
  @IsString() position: string;
  @IsString() description: string;
  @IsString() requiredSkills: string;

  @IsEnum(JobContractType)
  contractType: JobContractType;

  @IsOptional()
  @IsString()
  deadline?: string;
}
