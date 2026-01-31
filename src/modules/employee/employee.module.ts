import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from './employee.service';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { Meeting } from '../../entities/meeting.entity';
import { EmployeeController } from './employee.controller';
import { User } from 'src/entities/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, Meeting,User])],
  providers: [EmployeeService],
  exports: [EmployeeService],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
