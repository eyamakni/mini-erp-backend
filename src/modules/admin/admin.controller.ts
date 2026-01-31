import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { AdminService } from './admin.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesDto } from './dto/list-employees.dto';
import { DisableEmployeeDto } from './dto/disable-employee.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // B) Ajouter un employé
  @Post('employees')
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.adminService.createEmployee(dto);
  }

  // B) Liste + filtre/recherche
  @Get('employees')
  listEmployees(@Query() query: ListEmployeesDto) {
      console.log('QUERY RECEIVED:', query);
    return this.adminService.listEmployees(query);
  }

  // B) Profil employé
  @Get('employees/:id')
  getEmployee(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getEmployee(id);
  }
  @Patch('employees/:id/enable')
enableEmployee(@Param('id') id: string) {
  return this.adminService.enableEmployee(+id);
}

  @Patch('employees/:id/disable')
  disableEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DisableEmployeeDto,
  ) {
    return this.adminService.disableEmployee(id, dto);
  }
  @Get('dashboard')
getDashboard() {
  return this.adminService.getDashboardStats();
}

}
