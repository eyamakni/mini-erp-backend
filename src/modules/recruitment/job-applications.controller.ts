import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JobApplicationsService } from './job-applications.service';
import { ApplyJobDto } from './dto/apply-job.dto';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { ApplicationStatus } from '../../entities/job-application.entity';

//  accepter seulement PDF
function pdfFileFilter(req: any, file: Express.Multer.File, cb: any) {
  if (file.mimetype !== 'application/pdf') {
    return cb(new BadRequestException('CV must be a PDF file'), false);
  }
  cb(null, true);
}

// nom de fichier unique
function fileName(req: any, file: Express.Multer.File, cb: any) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  cb(null, `cv-${unique}${extname(file.originalname)}`);
}

@Controller('applications')
export class JobApplicationsController {
  constructor(private readonly service: JobApplicationsService) {}

  @Post('jobs/:jobId/apply')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: './uploads/cv',
        filename: fileName,
      }),
      fileFilter: pdfFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async apply(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Body() dto: ApplyJobDto,
    @UploadedFile() cv?: Express.Multer.File,
  ) {
    if (!cv) throw new BadRequestException('CV file is required');

    const saved = await this.service.apply(jobId, dto, cv.path);

    return {
      message: 'Application submitted successfully',
      applicationId: saved.id,
    };
  }
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin')
listAdmin(
  @Query('jobOfferId') jobOfferId?: string,
  @Query('status') status?: ApplicationStatus,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  return this.service.listAdmin({
    jobOfferId: jobOfferId ? Number(jobOfferId) : undefined,
    status,
    from,
    to,
  });
}


@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin/:id')
detailsAdmin(@Param('id', ParseIntPipe) id: number) {
  return this.service.getOneAdmin(id);
}


 @UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Patch('admin/:id')
updateAdmin(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateApplicationStatusDto,
) {
  return this.service.updateStatus(id, dto);
}

  
}
