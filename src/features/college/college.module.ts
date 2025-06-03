import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { College } from './entities/college.entity';
import { Performance } from './entities/performance.entity';
import { CollegeController } from './college.controller';
import { CollegeService } from './college.service';
import { State } from './entities/state.entity';
import { District } from './entities/district.entity';
import { Country } from './entities/country.entity';
import { CollegeCourse } from '../course/entities/college_course.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { CategorySection } from './entities/category-section.entity';
import { RecentCollegeService } from './recent-college.service';
import { RecentCollege } from './entities/recent-college.entity';
import { RecentCollegeController } from './recent-college.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/common/middleware/jwt.strategy';
import { User } from 'src/entities/user/user.entity';
import { Role } from 'src/entities/user/roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([College, Performance, State, District, Country, CollegeCourse, CategorySection, RecentCollege, User, Role]),
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
  controllers: [CollegeController, SearchController, RecentCollegeController],
  providers: [CollegeService, SearchService, RecentCollegeService, JwtStrategy],
  exports: [CollegeService, SearchService, RecentCollegeService],
})
export class CollegeModule { }