import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOffer, JobOfferStatus } from '../../entities/job-offer.entity';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

@Injectable()
export class JobOffersService {
  constructor(
    @InjectRepository(JobOffer)
    private jobOfferRepo: Repository<JobOffer>,
  ) {}

  create(dto: CreateJobOfferDto) {
    const offer = this.jobOfferRepo.create(dto);
    return this.jobOfferRepo.save(offer);
  }

  findAllPublic() {
    return this.jobOfferRepo.find({
      where: { status: JobOfferStatus.OPEN },
      order: { createdAt: 'DESC' },
    });
  }

async close(id: number) {
  const offer = await this.jobOfferRepo.findOne({ where: { id } });
  if (!offer) throw new NotFoundException('Job offer not found');

  offer.status = JobOfferStatus.CLOSED;
  return this.jobOfferRepo.save(offer);
}
  async update(id: number, dto: UpdateJobOfferDto) {
    const offer = await this.jobOfferRepo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Job offer not found');

    if (dto.position !== undefined) offer.position = dto.position;
    if (dto.description !== undefined) offer.description = dto.description;
    if (dto.requiredSkills !== undefined) offer.requiredSkills = dto.requiredSkills;
    if (dto.contractType !== undefined) offer.contractType = dto.contractType;
    if (dto.deadline !== undefined) offer.deadline = dto.deadline;

    return this.jobOfferRepo.save(offer);
  }
 async remove(id: number) {
    const offer = await this.jobOfferRepo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Job offer not found');

    await this.jobOfferRepo.remove(offer);
    return { message: 'Job offer deleted', id };
  }
}
