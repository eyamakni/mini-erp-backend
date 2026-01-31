import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication } from '../../entities/job-application.entity';
import { JobOffer } from '../../entities/job-offer.entity';
import { ApplyJobDto } from './dto/apply-job.dto';
import { MailService } from '../mail/mail.service';
import { Between } from 'typeorm';
import { ApplicationStatus } from '../../entities/job-application.entity';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private appRepo: Repository<JobApplication>,
    @InjectRepository(JobOffer)
    private offerRepo: Repository<JobOffer>,
    private mailService: MailService,
  ) {}

  async apply(jobId: number, dto: ApplyJobDto, cvPath: string) {
    const offer = await this.offerRepo.findOne({ where: { id: jobId } });
    if (!offer) throw new NotFoundException('Job offer not found');

    const app = this.appRepo.create({
      jobOffer: offer,
      ...dto,
      cvPath,
    });

    const saved = await this.appRepo.save(app);

   

    return saved;
  }

async listAdmin(filters: {
  jobOfferId?: number;
  status?: ApplicationStatus;
  from?: string;
  to?: string;
}) {
  const where: any = {};

  if (filters.jobOfferId) {
    where.jobOffer = { id: filters.jobOfferId };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.from && filters.to) {
    where.createdAt = Between(
      new Date(filters.from),
      new Date(filters.to),
    );
  }

  return this.appRepo.find({
    where,
    relations: ['jobOffer'],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      jobOffer: {
        id: true,
        position: true,
      },
    },
    order: { createdAt: 'DESC' },
  });
}

async getOneAdmin(id: number) {
  const app = await this.appRepo.findOne({
    where: { id },
    relations: ['jobOffer'],
  });

  if (!app) throw new NotFoundException('Application not found');

  return app;
}

async updateStatus(id: number, dto: UpdateApplicationStatusDto) {
  const app = await this.appRepo.findOne({ where: { id } });
  if (!app) throw new NotFoundException('Application not found');

  app.status = dto.status;
  if (dto.adminNotes !== undefined) {
    app.adminNotes = dto.adminNotes;
  }

  return this.appRepo.save(app);
}
}
