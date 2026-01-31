import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('jobs')
export class JobOffersController {
  constructor(private service: JobOffersService) {}

  // Public (visiteur)
  @Get()
  listPublic() {
    return this.service.findAllPublic();
  }

  // Admin
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateJobOfferDto) {
    return this.service.create(dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/close')
  close(@Param('id') id: number) {
    return this.service.close(Number(id));
  }
}
