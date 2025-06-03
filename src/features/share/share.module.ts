import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/common/middleware/jwt.strategy';
import { User } from 'src/entities/user/user.entity';
import { Role } from 'src/entities/user/roles.entity';
import { College } from '../college/entities/college.entity';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { CollegeService } from '../college/college.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { EmailService } from 'src/email/email.service';
import { CollegeCourse } from '../course/entities/college_course.entity';
import { CategorySection } from '../college/entities/category-section.entity';
import { District } from '../college/entities/district.entity';
import { Country } from '../college/entities/country.entity';
import { State } from '../college/entities/state.entity';
import { UserLoginHistory } from 'src/entities/user/user-login-history.entity';
import { OTC } from 'src/entities/user/otc.entity';
import { PasswordArchive } from 'src/entities/user/password-archive.entity';
import { RefreshToken } from 'src/entities/user/refresh-token.entity';
import { DateService } from 'src/shared/services/date.service';
import { TokenService } from 'src/auth/token.service';
import { StorageService } from 'src/shared/services/storage.service';
import { UserLoginHistoryService } from 'src/auth/user-login-history.service';
import { CommonService } from 'src/common/services/common.service';

@Module({
  imports: [TypeOrmModule.forFeature([College, Performance, CollegeCourse, CategorySection, State, District, Country, User, RefreshToken, PasswordArchive, Role, OTC, UserLoginHistory, User, Role]),
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
  controllers: [ShareController],
  providers: [ShareService, CollegeService, AuthService, EmailService, JwtStrategy, DateService, TokenService , StorageService, UserLoginHistoryService, UserService, CommonService],
  exports: [ShareService, CollegeService, AuthService, EmailService, JwtStrategy],
})
export class ShareModule { }