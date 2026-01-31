import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Meeting } from '../../entities/meeting.entity';
import { User } from '../../entities/user.entity';

import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';


@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepo: Repository<Meeting>,

    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,

  ) {}


  async createByEmployee(userId: number, dto: CreateMeetingDto) {
    const users = await this.usersRepo.find({
      where: { id: In(dto.participantIds) },
    });

    const creator = await this.usersRepo.findOne({ where: { id: userId } });
    if (creator && !users.find((u) => u.id === userId)) {
      users.push(creator);
    }

    const meeting = this.meetingRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      startAt: new Date(dto.startAt),
      durationMinutes: dto.durationMinutes,
      participants: users,
      isActive: true,
    });

    const saved = await this.meetingRepo.save(meeting);


    return saved;
  }

  
 async findMine(userId: number) {
  return this.meetingRepo
    .createQueryBuilder('m')
    .leftJoinAndSelect('m.participants', 'p')
    .where('p.id = :id', { id: userId })
    .andWhere('m.isActive = true')
    .orderBy('m.startAt', 'ASC')
    .getMany();
}


  async getMineById(userId: number, meetingId: number) {
    const meeting = await this.meetingRepo.findOne({
      where: { id: meetingId },
      relations: ['participants'],
    });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const isParticipant = meeting.participants.some((u) => u.id === userId);
    if (!isParticipant) throw new ForbiddenException('Access denied');

    return meeting;
  }

  async updateMine(userId: number, meetingId: number, dto: UpdateMeetingDto) {
    const meeting = await this.meetingRepo.findOne({
      where: { id: meetingId },
      relations: ['participants'],
    });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const isParticipant = meeting.participants.some((u) => u.id === userId);
    if (!isParticipant) throw new ForbiddenException('Access denied');

    if (dto.title !== undefined) meeting.title = dto.title;
    if (dto.description !== undefined) meeting.description = dto.description;
    if (dto.startAt !== undefined) meeting.startAt = new Date(dto.startAt);
    if (dto.durationMinutes !== undefined)
      meeting.durationMinutes = dto.durationMinutes;

    return this.meetingRepo.save(meeting);
  }

 
  async cancelMine(userId: number, meetingId: number) {
    const meeting = await this.meetingRepo.findOne({
      where: { id: meetingId },
      relations: ['participants'],
    });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const isParticipant = meeting.participants.some((u) => u.id === userId);
    if (!isParticipant) throw new ForbiddenException('Access denied');

    meeting.isActive = false;
    return this.meetingRepo.save(meeting);
  }
}
