import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { MailService } from '../mail/mail.service';
import { LeaveRequest, LeaveStatus } from '../../entities/leave-request.entity';
import { User, UserRole } from '../../entities/user.entity';
import { generateRandomPassword } from '../../common/utils/password.util';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesDto } from './dto/list-employees.dto';
import { DisableEmployeeDto } from './dto/disable-employee.dto';
import { JobApplication } from 'src/entities/job-application.entity';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(LeaveRequest)
  private leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(JobApplication) private appRepo: Repository<JobApplication>,

    private mailService: MailService,
  ) {}
async createEmployee(dto: CreateEmployeeDto) {
  const companyEmail = `${dto.firstName}.${dto.lastName}`
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z.]/g, '') + '@company.com';

  const exists = await this.usersRepo.findOne({
    where: { email: companyEmail },
  });
  if (exists) {
    throw new BadRequestException('Generated company email already exists');
  }

  const rawPassword = generateRandomPassword(10);
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const user = this.usersRepo.create({
    email: companyEmail,               
    firstName: dto.firstName,
    lastName: dto.lastName,
    passwordHash,
    role: UserRole.EMPLOYEE,
    position: dto.position,
    isActive: true,
    mustChangePassword: true,
  });

  await this.usersRepo.save(user);

  await this.mailService.sendWelcomeEmployeeEmail({
    to: dto.personalEmail, 
    fullName: `${user.firstName} ${user.lastName}`,
    email: companyEmail,   
    tempPassword: rawPassword,
    position: String(user.position ?? ''),
  });

  return {
    message: 'Employee created successfully',
    id: user.id,
    companyEmail,
  };
}

async listEmployees(query: ListEmployeesDto) {
  const qb = this.usersRepo.createQueryBuilder('u');

  // base
  qb.where('u.role = :role', { role: UserRole.EMPLOYEE });

  // filtre position
  if (query.position) {
    qb.andWhere('u.position = :position', {
      position: query.position,
    });
  }

  // recherche texte
  if (query.q) {
    qb.andWhere(
      '(u.email LIKE :q OR u.firstName LIKE :q OR u.lastName LIKE :q)',
      { q: `%${query.q}%` },
    );
  }

  qb.orderBy('u.createdAt', 'DESC');

  return qb.getMany();
}


  async getEmployee(id: number) {
    const user = await this.usersRepo.findOne({ where: { id, role: UserRole.EMPLOYEE } });
    if (!user) throw new NotFoundException('Employee not found');

    return user;
  }
async disableEmployee(id: number, dto: DisableEmployeeDto) {
  const user = await this.usersRepo.findOne({
    where: { id, role: UserRole.EMPLOYEE },
  });

  if (!user) {
    throw new NotFoundException('Employee not found');
  }

  user.isActive = false;
  user.refreshTokenHash = null;
  await this.usersRepo.save(user);

  await this.mailService.sendAccountDisabledEmail({
    to: user.personalEmail ?? user.email, 
    fullName: `${user.firstName} ${user.lastName}`,
    reason: dto.reason,
  });

  return {
    message: 'Employee disabled successfully',
    id: user.id,
  };
}
async enableEmployee(id: number) {
  const user = await this.usersRepo.findOne({
    where: { id, role: UserRole.EMPLOYEE },
  });

  if (!user) {
    throw new NotFoundException('Employee not found');
  }
  user.isActive = true;
  user.mustChangePassword = true;
  await this.usersRepo.save(user);

  return {
    message: 'Employee enabled successfully',
    id: user.id,
  };
}
async getDashboardStats() {
  //  Total employees
  const totalEmployees = await this.usersRepo.count({
    where: { role: UserRole.EMPLOYEE },
  });

  //  Employees by position
  const raw = await this.usersRepo
    .createQueryBuilder('u')
    .select('u.position', 'position')
    .addSelect('COUNT(*)', 'count')
    .where('u.role = :role', { role: UserRole.EMPLOYEE })
    .groupBy('u.position')
    .getRawMany();

  const employeesByPosition = raw.map((r) => ({
    position: r.position ?? 'UNKNOWN',
    count: Number(r.count),
  }));

  //  Leaves stats
  const rawLeaves = await this.leaveRepo
    .createQueryBuilder('l')
    .select('l.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .groupBy('l.status')
    .getRawMany();

  const leaves = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  for (const r of rawLeaves) {
    const count = Number(r.count);
    if (r.status === LeaveStatus.PENDING) leaves.pending = count;
    if (r.status === LeaveStatus.APPROVED) leaves.approved = count;
    if (r.status === LeaveStatus.REJECTED) leaves.rejected = count;
  }

  const applicationsReceived = await this.appRepo.count();

 
  const upcomingMeetings = 0;

  return {
    totalEmployees,
    employeesByPosition,
    leaves,
    applicationsReceived,
    upcomingMeetings,
  };
}


}
