import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { LeaveRequest } from 'src/entities/leave-request.entity';
import { JobApplication } from 'src/entities/job-application.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User , LeaveRequest,JobApplication]),
MailModule,],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
