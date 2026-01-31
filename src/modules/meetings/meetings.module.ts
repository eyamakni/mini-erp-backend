import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Meeting } from '../../entities/meeting.entity';
import { User } from '../../entities/user.entity';

import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';

// (optionnel – à activer quand tu feras les emails)
// import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Meeting,
      User, // pour participants
    ]),
    // MailModule,
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [
    MeetingsService, // utilisé par dashboard admin / employee
  ],
})
export class MeetingsModule {}
