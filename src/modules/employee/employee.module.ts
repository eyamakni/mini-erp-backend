import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from './employee.service';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { Meeting } from '../../entities/meeting.entity';
import { EmployeeController } from './employee.controller';
@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, Meeting])],
  providers: [EmployeeService],
  exports: [EmployeeService],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
