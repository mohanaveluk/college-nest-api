import { Module, OnModuleInit  } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { adminConfig, databaseConfig, googleCloudConfig, jwtConfig, smtpConfig } from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CommonModule } from './common/common.module';
import { PatientModule } from './patient/patient.module';
import { CollegeModule } from './features/college/college.module';
import { CourseModule } from './features/course/course.module';
import { ContactModule } from './contact/contact.module';
import { ShareModule } from './features/share/share.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, 
      load: [databaseConfig, jwtConfig, adminConfig, googleCloudConfig, smtpConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => (getDatabaseConfig(configService)),
    }),
    AuthModule,
    UserModule,
    CommonModule,
    PatientModule,
    CollegeModule,
    CourseModule,
    ContactModule,
    ShareModule
  ],
  controllers: [AppController, ],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
