import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollegeCourse } from './entities/college_course.entity';

import { CollegeCourseController } from './college-course.controller';
import { College } from '../college/entities/college.entity';
import { State } from '../college/entities/state.entity';
import { District } from '../college/entities/district.entity';
import { Country } from '../college/entities/country.entity';
import { CategorySection } from '../college/entities/category-section.entity';
import { Course } from './entities/course.entity';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CollegeCourseService } from './college-course.service';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';

@Module({
  imports: [TypeOrmModule.forFeature([College, Performance, State, District, Country, Course, CollegeCourse, CategorySection]),
PassportModule.register({
    defaultStrategy: 'jwt',
    session: false
  }),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get('JWT_SECRET') || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    inject: [ConfigService],
  })
  ],

  controllers: [CollegeCourseController, CourseController],
  providers: [CollegeCourseService, CourseService],
  exports: [CollegeCourseService, CourseService],
})
export class CourseModule {}