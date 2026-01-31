import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeeService } from './employee.service';

@Controller('employee')
@UseGuards(AuthGuard('jwt'))
export class EmployeeController {
  constructor(private readonly service: EmployeeService) {}

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.service.getEmployeeDashboard(req.user.userId);
  }
}
