import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { LeavesModule } from './modules/leaves/leaves.modules';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Base de données MySQL
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // DEV ONLY
      }),
    }),

   
    AuthModule,
    AdminModule,
    LeavesModule,
    RecruitmentModule,
    EmployeeModule,
    MeetingsModule,
   
  ],
})
export class AppModule {}
