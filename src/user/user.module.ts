import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from 'src/entities/user/user.entity';
import { CommonService } from 'src/common/services/common.service';
import { DateService } from 'src/shared/services/date.service';
import { TokenService } from 'src/auth/token.service';
import { StorageService } from 'src/shared/services/storage.service';
import { EmailService } from 'src/email/email.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RefreshToken } from 'src/entities/user/refresh-token.entity';
import { PassportModule } from '@nestjs/passport';
import { PasswordArchive } from 'src/entities/user/password-archive.entity';
import { Role } from 'src/entities/user/roles.entity';
import { OTC } from 'src/entities/user/otc.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordArchive, Role, OTC, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' ,
      session: false}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    DateService,
    TokenService,
    StorageService,
    EmailService, 
    CommonService
  ],
})
export class UserModule {}